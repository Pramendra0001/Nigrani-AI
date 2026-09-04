"""End-to-End Automated Test Suite for Nigrani AI Authentication, Security, and Core APIs."""

import pytest
import asyncio
from datetime import datetime
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import init_db
from app.utils.security import normalize_phone, normalize_email, hash_password, verify_password


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

    # Password hashing
    h = hash_password("SecretPassword123!")
    assert verify_password("SecretPassword123!", h) is True
    assert verify_password("WrongPassword!", h) is False


@pytest.mark.asyncio
async def test_auth_lifecycle():
    """Verify registration, duplicate prevention, verification, login, and profile workflow."""
    await init_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Healthcheck
        r_health = await client.get("/health")
        assert r_health.status_code == 200
        assert r_health.json()["status"] == "ok"

        # 2. User Registration
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

        # Extract sandbox OTPs
        email_otp = data["verification"].get("sandbox_email_otp")
        phone_otp = data["verification"].get("sandbox_phone_otp")

        # 3. Duplicate Email Prevention
        dup_email_payload = dict(reg_payload)
        dup_email_payload["phone"] = "+919999999999"
        r_dup_email = await client.post("/api/auth/register", json=dup_email_payload)
        assert r_dup_email.status_code == 400
        assert "already exists" in r_dup_email.json()["detail"]

        # 4. Duplicate Phone Prevention
        dup_phone_payload = dict(reg_payload)
        dup_phone_payload["email"] = "different_email@gov.in"
        r_dup_phone = await client.post("/api/auth/register", json=dup_phone_payload)
        assert r_dup_phone.status_code == 400
        assert "already exists" in r_dup_phone.json()["detail"]

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

        # 7. Login with Email
        r_login = await client.post("/api/auth/login", json={"identifier": test_email, "password": "SecurePassword2026!"})
        assert r_login.status_code == 200
        token = r_login.json()["access_token"]
        assert token

        # 8. Access Protected Route (/api/auth/me)
        headers = {"Authorization": f"Bearer {token}"}
        r_me = await client.get("/api/auth/me", headers=headers)
        assert r_me.status_code == 200
        assert r_me.json()["full_name"] == "Divisional Vigilance Officer"

        # 9. Update Profile
        r_prof = await client.put("/api/auth/profile", headers=headers, json={"full_name": "Senior Vigilance Director"})
        assert r_prof.status_code == 200
        assert r_prof.json()["user"]["full_name"] == "Senior Vigilance Director"

        # 10. Dashboard API Access
        r_dash = await client.get("/api/dashboard")
        assert r_dash.status_code == 200
        assert "metrics" in r_dash.json()


if __name__ == "__main__":
    asyncio.run(test_security_normalizers())
    asyncio.run(test_auth_lifecycle())
    print("ALL TESTS PASSED SUCCESSFULLY.")
