"""Comprehensive Automated Test Suite for Nigrani AI Real OTP Authentication and Security Architecture."""

import os
import pytest
import asyncio
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_SANDBOX_OTP"] = "true"

from app.main import app
from app.config import settings
from app.database import init_db
from app.utils.security import (
    normalize_phone,
    normalize_email,
    hash_password,
    verify_password,
    generate_otp,
    hash_otp,
    verify_otp,
)
from app.services.sms_provider import MSG91Provider, TwilioProvider, SMSDeliveryError, get_sms_provider
from app.services.email_provider import (
    SMTPEmailProvider,
    ResendEmailProvider,
    BrevoEmailProvider,
    EmailDeliveryError,
    get_email_provider,
)
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_security_normalizers():
    """Verify phone and email normalization rules."""
    # Indian 10-digit formats
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("09876543210") == "+919876543210"
    assert normalize_phone("+91 98765 43210") == "+919876543210"
    assert normalize_phone("+91-98765-43210") == "+919876543210"

    # Email normalization
    assert normalize_email("  Analyst.User@Gov.IN  ") == "analyst.user@gov.in"
    with pytest.raises(ValueError):
        normalize_email("invalid-email-string")


@pytest.mark.asyncio
async def test_password_hashing_and_otp():
    """Verify PBKDF2 hashing and HMAC OTP verification."""
    h = hash_password("SecurePassword2026!")
    assert verify_password("SecurePassword2026!", h) is True
    assert verify_password("WrongPassword!", h) is False

    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()
    hashed = hash_otp(otp)
    assert verify_otp(otp, hashed) is True
    assert verify_otp("000000", hashed) is False


@pytest.mark.asyncio
async def test_msg91_provider_configuration_guard():
    """Verify that MSG91Provider strictly raises SMSDeliveryError when unconfigured."""
    provider = MSG91Provider(auth_key="", template_id="")
    with pytest.raises(SMSDeliveryError) as exc:
        await provider.send_otp("+919876543210", "123456")
    assert "configuration error" in str(exc.value)


@pytest.mark.asyncio
async def test_smtp_provider_configuration_guard():
    """Verify that SMTPEmailProvider strictly raises EmailDeliveryError when unconfigured."""
    provider = SMTPEmailProvider(host="")
    with pytest.raises(EmailDeliveryError) as exc:
        await provider.send_otp("officer@nic.in", "123456")
    assert "configuration error" in str(exc.value)


@pytest.mark.asyncio
async def test_resend_provider_configuration_guard():
    """Verify that ResendEmailProvider strictly raises EmailDeliveryError when API key is missing."""
    provider = ResendEmailProvider(api_key="")
    with pytest.raises(EmailDeliveryError) as exc:
        await provider.send_otp("officer@infrastructure.gov.in", "123456")
    assert "EMAIL_API_KEY must be configured" in str(exc.value)


@pytest.mark.asyncio
async def test_brevo_provider_configuration_guard():
    """Verify that BrevoEmailProvider strictly raises EmailDeliveryError when API key is missing."""
    provider = BrevoEmailProvider(api_key="")
    with pytest.raises(EmailDeliveryError) as exc:
        await provider.send_otp("officer@infrastructure.gov.in", "123456")
    assert "EMAIL_API_KEY must be configured" in str(exc.value)


@pytest.mark.asyncio
async def test_resend_provider_https_mock_dispatch():
    """Verify Resend HTTP REST dispatch sends correct headers and payload over HTTPS."""
    provider = ResendEmailProvider(api_key="re_mock_test_key", from_email="onboarding@resend.dev")

    class MockResponse:
        status_code = 200
        def json(self):
            return {"id": "resend_msg_12345"}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = MockResponse()
        result = await provider.send_otp("officer@domain.com", "987654")
        assert result is True
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        assert "Authorization" in call_kwargs["headers"]
        assert call_kwargs["headers"]["Authorization"] == "Bearer re_mock_test_key"
        assert call_kwargs["json"]["to"] == ["officer@domain.com"]
        assert "987654" in call_kwargs["json"]["html"]


@pytest.mark.asyncio
async def test_resend_provider_delivery_failure_handling():
    """Verify that Resend API error responses raise EmailDeliveryError without leaking secret tokens."""
    provider = ResendEmailProvider(api_key="re_mock_test_key")

    class MockErrorResponse:
        status_code = 403
        text = "Forbidden"
        def json(self):
            return {"message": "Domain not verified"}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = MockErrorResponse()
        with pytest.raises(EmailDeliveryError) as exc:
            await provider.send_otp("officer@domain.com", "987654")
        assert "Resend email delivery failed (HTTP 403)" in str(exc.value)
        assert "Domain not verified" in str(exc.value)
        # Verify plain OTP and secret token are NEVER in error message
        assert "987654" not in str(exc.value)
        assert "re_mock_test_key" not in str(exc.value)


@pytest.mark.asyncio
async def test_production_unconfigured_gateway_rejection():
    """Verify that in PRODUCTION mode, unconfigured gateways cause clear delivery failures and NEVER leak OTPs."""
    await init_db()

    prev_env = settings.ENVIRONMENT
    prev_sandbox = settings.ALLOW_SANDBOX_OTP
    settings.ENVIRONMENT = "production"
    settings.ALLOW_SANDBOX_OTP = False

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_email = f"prod_fail_{int(datetime.utcnow().timestamp())}@infrastructure.gov.in"
        test_phone = f"+9191{int(datetime.utcnow().timestamp()) % 100000000:08d}"

        r_reg = await client.post("/api/auth/register", json={
            "full_name": "Production Guard Test",
            "email": test_email,
            "phone": test_phone,
            "password": "SecurePassword2026!",
        })
        # In production without gateway credentials, registration MUST reject with HTTP 400
        assert r_reg.status_code == 400
        assert "OTP delivery failed" in r_reg.json()["detail"]
        # Ensure no OTP is leaked in response
        assert "123456" not in r_reg.text
        assert "sandbox_email_otp" not in r_reg.text

    settings.ENVIRONMENT = prev_env
    settings.ALLOW_SANDBOX_OTP = prev_sandbox


@pytest.mark.asyncio
async def test_auth_full_lifecycle():
    """Verify complete registration, duplicate prevention, verification, login, profile, and session management."""
    await init_db()
    settings.ENVIRONMENT = "test"
    settings.ALLOW_SANDBOX_OTP = True

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Healthcheck
        r_health = await client.get("/health")
        assert r_health.status_code == 200
        assert r_health.json()["status"] == "ok"

        # 2. Registration
        test_email = f"officer_{int(datetime.utcnow().timestamp())}@infrastructure.gov.in"
        test_phone = f"+9198{int(datetime.utcnow().timestamp()) % 100000000:08d}"

        reg_payload = {
            "full_name": "Divisional Vigilance Officer",
            "email": test_email,
            "phone": test_phone,
            "password": "SecurePassword2026!",
            "organization": "State Public Works Department",
            "designation": "Chief Vigilance Engineer",
        }

        r_reg = await client.post("/api/auth/register", json=reg_payload)
        assert r_reg.status_code == 201, r_reg.text
        data = r_reg.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email
        assert data["verification"]["email_verified"] is False
        assert data["verification"]["phone_verified"] is False

        email_otp = data["verification"].get("sandbox_email_otp")
        phone_otp = data["verification"].get("sandbox_phone_otp")

        # 3. Duplicate Account Prevention
        dup_email_payload = dict(reg_payload)
        dup_email_payload["phone"] = "+919999999999"
        r_dup_email = await client.post("/api/auth/register", json=dup_email_payload)
        assert r_dup_email.status_code == 400
        assert "already exists" in r_dup_email.json()["detail"]

        dup_phone_payload = dict(reg_payload)
        dup_phone_payload["email"] = "different_email@gov.in"
        r_dup_phone = await client.post("/api/auth/register", json=dup_phone_payload)
        assert r_dup_phone.status_code == 400
        assert "already exists" in r_dup_phone.json()["detail"]

        # 4. Invalid OTP Validation
        r_bad_otp = await client.post("/api/auth/verify-email-otp", json={"email": test_email, "otp": "000000"})
        assert r_bad_otp.status_code == 400
        assert "Invalid verification code" in r_bad_otp.json()["detail"]

        # 5. Verify Email OTP
        if email_otp:
            r_v_email = await client.post("/api/auth/verify-email-otp", json={"email": test_email, "otp": email_otp})
            assert r_v_email.status_code == 200
            assert r_v_email.json()["email_verified"] is True

        # 6. Verify Phone OTP
        if phone_otp:
            r_v_phone = await client.post("/api/auth/verify-phone-otp", json={"phone": test_phone, "otp": phone_otp})
            assert r_v_phone.status_code == 200
            assert r_v_phone.json()["phone_verified"] is True

        # 7. Resend Cooldown Enforcement
        r_resend_fast = await client.post("/api/auth/resend-otp", json={"target": test_email, "code_type": "EMAIL_VERIFICATION"})
        # Should be rejected because cooldown (60s) has not expired
        assert r_resend_fast.status_code in (429, 400)
        assert "wait" in r_resend_fast.json()["detail"].lower()

        # 8. Login with Email and Phone
        r_login = await client.post("/api/auth/login", json={"identifier": test_email, "password": "SecurePassword2026!"})
        assert r_login.status_code == 200
        token = r_login.json()["access_token"]
        assert token

        # 9. Protected Routes & Profile Update
        headers = {"Authorization": f"Bearer {token}"}
        r_me = await client.get("/api/auth/me", headers=headers)
        assert r_me.status_code == 200
        assert r_me.json()["full_name"] == "Divisional Vigilance Officer"

        r_prof = await client.put("/api/auth/profile", headers=headers, json={"full_name": "Senior Vigilance Director"})
        assert r_prof.status_code == 200
        assert r_prof.json()["user"]["full_name"] == "Senior Vigilance Director"

        # 10. Sessions Management and Revocation
        r_sess = await client.get("/api/auth/sessions", headers=headers)
        assert r_sess.status_code == 200
        assert len(r_sess.json()) >= 1

        r_rev = await client.post("/api/auth/sessions/revoke-others", headers=headers)
        assert r_rev.status_code == 200

        # 11. Logout
        r_logout = await client.post("/api/auth/logout", headers=headers)
        assert r_logout.status_code == 200

        # 12. Account Deletion
        r_del = await client.request("DELETE", "/api/auth/account", headers=headers, json={"password_confirmation": "SecurePassword2026!"})
        assert r_del.status_code == 200
        assert "deleted" in r_del.json()["message"]


@pytest.mark.asyncio
async def test_google_oauth_production_guard():
    """Verify that Google OAuth rejects unverified tokens in production without GOOGLE_CLIENT_ID."""
    prev_env = settings.ENVIRONMENT
    prev_sandbox = settings.ALLOW_SANDBOX_OTP
    prev_gid = settings.GOOGLE_CLIENT_ID
    settings.ENVIRONMENT = "production"
    settings.ALLOW_SANDBOX_OTP = False
    settings.GOOGLE_CLIENT_ID = ""

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r_g = await client.post("/api/auth/google", json={"credential": "fake-token-sample"})
        assert r_g.status_code == 400
        assert "not configured" in r_g.json()["detail"].lower()

    settings.ENVIRONMENT = prev_env
    settings.ALLOW_SANDBOX_OTP = prev_sandbox
    settings.GOOGLE_CLIENT_ID = prev_gid
