"""Enterprise Email provider abstraction supporting HTTPS API delivery (Resend, Brevo), SMTP, and Development Sandbox."""

import asyncio
import logging
import smtplib
from abc import ABC, abstractmethod
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Tuple
import httpx

from app.config import settings
from app.utils.security import normalize_email

logger = logging.getLogger("nigrani.email")


class EmailDeliveryError(Exception):
    """Raised when email delivery fails or is unconfigured."""
    pass


def render_otp_email_templates(otp: str, expire_minutes: int) -> Tuple[str, str]:
    """Generates plain-text and high-fidelity HTML email bodies for OTP verification."""
    text_body = (
        f"Nigrani AI — Public Project Intelligence Platform\n\n"
        f"Your official verification code is: {otp}\n\n"
        f"This code will expire in {expire_minutes} minutes.\n"
        f"For security purposes, do NOT share this verification code with anyone.\n"
        f"If you did not request this code, please ignore this email."
    )

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: #0b1f38; color: #ffffff; padding: 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; }}
    .header p {{ margin: 6px 0 0 0; font-size: 12px; color: #93c5fd; }}
    .content {{ padding: 32px 24px; text-align: center; color: #1e293b; }}
    .code-box {{ display: inline-block; margin: 20px 0; padding: 14px 28px; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; }}
    .footer {{ padding: 16px 24px; background: #f1f5f9; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Nigrani AI</h1>
      <p>National Public Project Vigilance Platform</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; margin: 0 0 8px 0; color: #0f172a;">Account Verification</h2>
      <p style="font-size: 13px; margin: 0 0 16px 0; color: #475569;">Please use the one-time code below to verify your official vigilance officer identity:</p>
      <div class="code-box">{otp}</div>
      <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0;">This code is valid for <strong>{expire_minutes} minutes</strong>. Do not share this code with anyone.</p>
    </div>
    <div class="footer">
      This is an automated system notification from the Nigrani AI Security Gateway. If you did not initiate this request, please contact platform security immediately.
    </div>
  </div>
</body>
</html>
"""
    return text_body, html_body


class EmailProvider(ABC):
    """Abstract base class for Email OTP delivery."""

    @abstractmethod
    async def send_otp(self, email: str, otp: str, subject: str = "Nigrani AI — Official Verification Code") -> bool:
        """
        Sends OTP to recipient email.
        Returns True on success, raises EmailDeliveryError on failure.
        """
        pass


class ResendEmailProvider(EmailProvider):
    """
    Primary Production HTTPS Transactional Email Provider (Render-optimized).
    Uses the Resend REST API (https://api.resend.com/emails) over outbound HTTPS port 443,
    bypassing cloud platform SMTP socket port restrictions (Errno 101 Network is unreachable).
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ):
        self.api_key = (api_key if api_key is not None else settings.EMAIL_API_KEY).strip()
        self.from_email = (from_email if from_email is not None else settings.EMAIL_FROM or "onboarding@resend.dev").strip()
        self.from_name = (from_name if from_name is not None else settings.EMAIL_FROM_NAME or "Nigrani AI Vigilance").strip()
        self.api_url = "https://api.resend.com/emails"

    async def send_otp(self, email: str, otp: str, subject: str = "Nigrani AI — Official Verification Code") -> bool:
        if not self.api_key:
            logger.error("Resend API key missing: EMAIL_API_KEY is unset.")
            raise EmailDeliveryError(
                "Email delivery configuration error: EMAIL_API_KEY must be configured in environment for Resend."
            )

        clean_email = normalize_email(email)
        masked_email = f"{clean_email[:3]}***@{clean_email.split('@')[-1]}" if "@" in clean_email else clean_email
        text_body, html_body = render_otp_email_templates(otp, settings.OTP_EXPIRE_MINUTES)

        sender_header = f"{self.from_name} <{self.from_email}>" if self.from_name else self.from_email
        payload = {
            "from": sender_header,
            "to": [clean_email],
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)

                if response.status_code not in (200, 201):
                    err_detail = "Unknown error"
                    try:
                        err_json = response.json()
                        err_detail = err_json.get("message") or str(err_json)
                    except Exception:
                        err_detail = response.text[:200]

                    logger.error(f"Resend API error HTTP {response.status_code} for {masked_email}: {err_detail}")
                    raise EmailDeliveryError(f"Resend email delivery failed (HTTP {response.status_code}): {err_detail}")

                logger.info(f"Successfully dispatched verification email via Resend to {masked_email}")
                return True

        except httpx.RequestError as exc:
            logger.error(f"Network error connecting to Resend API: {str(exc)}")
            raise EmailDeliveryError("Unable to reach Resend email gateway. Please try again later.")
        except EmailDeliveryError:
            raise
        except Exception as exc:
            logger.exception("Unexpected exception in ResendEmailProvider")
            raise EmailDeliveryError(f"Email delivery failed: {str(exc)}")


class BrevoEmailProvider(EmailProvider):
    """
    Alternative Production HTTPS Transactional Email Provider (Brevo / Sendinblue).
    Uses the Brevo REST API v3 over HTTPS port 443.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ):
        self.api_key = (api_key if api_key is not None else settings.EMAIL_API_KEY).strip()
        self.from_email = (from_email if from_email is not None else settings.EMAIL_FROM or "no-reply@nigrani.gov.in").strip()
        self.from_name = (from_name if from_name is not None else settings.EMAIL_FROM_NAME or "Nigrani AI Vigilance").strip()
        self.api_url = "https://api.brevo.com/v3/smtp/email"

    async def send_otp(self, email: str, otp: str, subject: str = "Nigrani AI — Official Verification Code") -> bool:
        if not self.api_key:
            logger.error("Brevo API key missing: EMAIL_API_KEY is unset.")
            raise EmailDeliveryError(
                "Email delivery configuration error: EMAIL_API_KEY must be configured in environment for Brevo."
            )

        clean_email = normalize_email(email)
        masked_email = f"{clean_email[:3]}***@{clean_email.split('@')[-1]}" if "@" in clean_email else clean_email
        text_body, html_body = render_otp_email_templates(otp, settings.OTP_EXPIRE_MINUTES)

        payload = {
            "sender": {"name": self.from_name, "email": self.from_email},
            "to": [{"email": clean_email}],
            "subject": subject,
            "htmlContent": html_body,
            "textContent": text_body,
        }

        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)

                if response.status_code not in (200, 201):
                    err_detail = "Unknown error"
                    try:
                        err_json = response.json()
                        err_detail = err_json.get("message") or str(err_json)
                    except Exception:
                        err_detail = response.text[:200]

                    logger.error(f"Brevo API error HTTP {response.status_code} for {masked_email}: {err_detail}")
                    raise EmailDeliveryError(f"Brevo email delivery failed (HTTP {response.status_code}): {err_detail}")

                logger.info(f"Successfully dispatched verification email via Brevo to {masked_email}")
                return True

        except httpx.RequestError as exc:
            logger.error(f"Network error connecting to Brevo API: {str(exc)}")
            raise EmailDeliveryError("Unable to reach Brevo email gateway. Please try again later.")
        except EmailDeliveryError:
            raise
        except Exception as exc:
            logger.exception("Unexpected exception in BrevoEmailProvider")
            raise EmailDeliveryError(f"Email delivery failed: {str(exc)}")


class SMTPEmailProvider(EmailProvider):
    """
    Standard SMTP email delivery provider for local development or custom servers.
    Executes asynchronously via thread-pool offload.
    Note: Direct SMTP ports (25, 465, 587) are blocked on Render free/standard tiers.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        from_email: Optional[str] = None,
        use_tls: Optional[bool] = None,
        use_ssl: Optional[bool] = None,
    ):
        self.host = (host if host is not None else settings.SMTP_HOST).strip()
        self.port = port if port is not None else settings.SMTP_PORT
        self.user = (user if user is not None else settings.SMTP_USER).strip()
        self.password = (password if password is not None else settings.SMTP_PASSWORD).strip()
        self.from_email = (from_email if from_email is not None else settings.SMTP_FROM_EMAIL or self.user or "no-reply@nigrani.gov.in").strip()
        self.use_tls = use_tls if use_tls is not None else settings.SMTP_USE_TLS
        self.use_ssl = use_ssl if use_ssl is not None else settings.SMTP_USE_SSL

    def _send_email_sync(self, to_email: str, otp: str, subject: str) -> None:
        """Synchronous worker function to connect and send email via smtplib."""
        if not self.host:
            raise EmailDeliveryError("Email delivery configuration error: SMTP_HOST must be configured in environment.")

        text_body, html_body = render_otp_email_templates(otp, settings.OTP_EXPIRE_MINUTES)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Nigrani AI Vigilance <{self.from_email}>"
        msg["To"] = to_email
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            if self.use_ssl:
                server = smtplib.SMTP_SSL(self.host, self.port, timeout=10.0)
            else:
                server = smtplib.SMTP(self.host, self.port, timeout=10.0)
                if self.use_tls:
                    server.starttls()

            if self.user and self.password:
                server.login(self.user, self.password)

            server.send_message(msg)
            server.quit()

        except smtplib.SMTPAuthenticationError as exc:
            logger.error(f"SMTP authentication failed for user {self.user}: {str(exc)}")
            raise EmailDeliveryError("SMTP authentication error: Invalid SMTP username or password.")
        except (smtplib.SMTPException, OSError) as exc:
            logger.error(f"SMTP delivery error to {to_email}: {str(exc)}")
            raise EmailDeliveryError(f"Email delivery failed: {str(exc)}")

    async def send_otp(self, email: str, otp: str, subject: str = "Nigrani AI — Official Verification Code") -> bool:
        clean_email = normalize_email(email)
        try:
            await asyncio.to_thread(self._send_email_sync, clean_email, otp, subject)
            masked_email = f"{clean_email[:3]}***@{clean_email.split('@')[-1]}"
            logger.info(f"Successfully dispatched verification email via SMTP to {masked_email}")
            return True
        except EmailDeliveryError:
            raise
        except Exception as exc:
            logger.exception("Unexpected error in SMTPEmailProvider")
            raise EmailDeliveryError(f"Email dispatch failed: {str(exc)}")


class DevelopmentSandboxEmailProvider(EmailProvider):
    """
    Development/Test mock provider.
    STRICT SECURITY GUARD:
    Never usable in production mode.
    """

    async def send_otp(self, email: str, otp: str, subject: str = "Nigrani AI — Official Verification Code") -> bool:
        if not settings.is_sandbox_otp_allowed():
            raise EmailDeliveryError("Sandbox Email provider is strictly prohibited in production mode.")

        masked_email = f"{email[:3]}***@{email.split('@')[-1]}" if "@" in email else email
        logger.info(f"[DEV SANDBOX EMAIL] Mock OTP generated for {masked_email}")
        return True


def get_email_provider() -> EmailProvider:
    """Factory returning configured EmailProvider instance according to application settings."""
    provider_name = settings.EMAIL_PROVIDER.lower().strip()

    if provider_name == "smtp":
        if not settings.SMTP_HOST and settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxEmailProvider()
        return SMTPEmailProvider()

    elif provider_name == "brevo":
        if not settings.EMAIL_API_KEY and settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxEmailProvider()
        return BrevoEmailProvider()

    elif provider_name == "sandbox":
        if settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxEmailProvider()
        raise EmailDeliveryError("Sandbox Email provider is strictly disabled in production. Configure EMAIL_API_KEY.")

    else:
        # Default is resend (HTTPS REST API)
        if not settings.EMAIL_API_KEY and settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxEmailProvider()
        return ResendEmailProvider()
