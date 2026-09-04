"""Enterprise SMS provider abstraction supporting MSG91, Twilio, and Development Sandbox."""

import logging
import httpx
from abc import ABC, abstractmethod
from typing import Optional

from app.config import settings
from app.utils.security import normalize_phone

logger = logging.getLogger("nigrani.sms")


class SMSDeliveryError(Exception):
    """Raised when an SMS delivery fails or is unconfigured."""
    pass


class SMSProvider(ABC):
    """Abstract base class for SMS OTP delivery."""

    @abstractmethod
    async def send_otp(self, phone: str, otp: str) -> bool:
        """
        Sends OTP to phone number in E.164 format.
        Returns True on success, raises SMSDeliveryError on failure.
        """
        pass


class MSG91Provider(SMSProvider):
    """
    Official MSG91 OTP API Provider (India-focused primary SMS gateway).
    Uses the official MSG91 OTP v5 API: https://control.msg91.com/api/v5/otp
    """

    def __init__(
        self,
        auth_key: Optional[str] = None,
        template_id: Optional[str] = None,
        sender_id: Optional[str] = None,
    ):
        self.auth_key = (auth_key or settings.MSG91_AUTH_KEY).strip()
        self.template_id = (template_id or settings.MSG91_TEMPLATE_ID).strip()
        self.sender_id = (sender_id or settings.MSG91_SENDER_ID).strip()
        self.base_url = "https://control.msg91.com/api/v5/otp"

    async def send_otp(self, phone: str, otp: str) -> bool:
        if not self.auth_key or not self.template_id:
            logger.error("MSG91 credentials missing: MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is unset.")
            raise SMSDeliveryError(
                "SMS gateway configuration error: MSG91_AUTH_KEY and MSG91_TEMPLATE_ID must be configured in environment."
            )

        # Normalize phone: MSG91 expects country code without '+' (e.g. 919876543210)
        clean_phone = normalize_phone(phone).lstrip("+")

        params = {
            "template_id": self.template_id,
            "mobile": clean_phone,
            "authkey": self.auth_key,
            "otp": otp,
        }
        if self.sender_id:
            params["sender"] = self.sender_id

        headers = {
            "authkey": self.auth_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        body = {
            "otp": otp,
            "var1": otp,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.base_url,
                    params=params,
                    json=body,
                    headers=headers,
                )

                if response.status_code != 200:
                    logger.error(f"MSG91 API error HTTP {response.status_code}: {response.text}")
                    raise SMSDeliveryError(f"MSG91 delivery failed with HTTP {response.status_code}.")

                data = response.json()
                if data.get("type") == "error":
                    error_msg = data.get("message", "Unknown MSG91 provider error")
                    logger.error(f"MSG91 returned error response: {error_msg}")
                    raise SMSDeliveryError(f"MSG91 provider error: {error_msg}")

                logger.info(f"Successfully dispatched OTP via MSG91 to {phone[:6]}****")
                return True

        except httpx.RequestError as exc:
            logger.error(f"Network error connecting to MSG91 API: {str(exc)}")
            raise SMSDeliveryError("Unable to reach SMS gateway provider. Please try again later.")
        except SMSDeliveryError:
            raise
        except Exception as exc:
            logger.exception("Unexpected exception in MSG91Provider")
            raise SMSDeliveryError(f"SMS delivery failed: {str(exc)}")


class TwilioProvider(SMSProvider):
    """
    Twilio SMS Provider (Global SMS fallback).
    Uses Twilio Programmable SMS API.
    """

    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_phone: Optional[str] = None,
    ):
        self.account_sid = (account_sid or settings.TWILIO_ACCOUNT_SID).strip()
        self.auth_token = (auth_token or settings.TWILIO_AUTH_TOKEN).strip()
        self.from_phone = (from_phone or settings.TWILIO_FROM_PHONE).strip()

    async def send_otp(self, phone: str, otp: str) -> bool:
        if not self.account_sid or not self.auth_token or not self.from_phone:
            logger.error("Twilio credentials missing: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_PHONE unset.")
            raise SMSDeliveryError(
                "SMS gateway configuration error: Twilio credentials must be configured in environment."
            )

        clean_phone = normalize_phone(phone)
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        data = {
            "To": clean_phone,
            "From": self.from_phone,
            "Body": f"Your Nigrani AI verification code is {otp}. Valid for 10 minutes. Do not share this code.",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    data=data,
                    auth=(self.account_sid, self.auth_token),
                )

                if response.status_code not in (200, 201):
                    logger.error(f"Twilio API error HTTP {response.status_code}: {response.text}")
                    raise SMSDeliveryError(f"Twilio delivery failed with HTTP {response.status_code}.")

                logger.info(f"Successfully dispatched OTP via Twilio to {phone[:6]}****")
                return True

        except httpx.RequestError as exc:
            logger.error(f"Network error connecting to Twilio API: {str(exc)}")
            raise SMSDeliveryError("Unable to reach Twilio SMS gateway. Please try again later.")
        except SMSDeliveryError:
            raise
        except Exception as exc:
            logger.exception("Unexpected exception in TwilioProvider")
            raise SMSDeliveryError(f"Twilio SMS delivery failed: {str(exc)}")


class DevelopmentSandboxSMSProvider(SMSProvider):
    """
    Development/Test mock provider.
    STRICT SECURITY GUARD:
    Never usable in production mode.
    """

    async def send_otp(self, phone: str, otp: str) -> bool:
        if not settings.is_sandbox_otp_allowed():
            raise SMSDeliveryError("Sandbox SMS provider is strictly prohibited in production mode.")

        # In dev/test mode, record mock dispatch safely
        logger.info(f"[DEV SANDBOX SMS] Mock OTP dispatched to {phone}")
        return True


def get_sms_provider() -> SMSProvider:
    """Factory returning configured SMSProvider instance according to application settings."""
    provider_name = settings.SMS_PROVIDER.lower().strip()

    if provider_name == "twilio":
        if not settings.TWILIO_ACCOUNT_SID and settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxSMSProvider()
        return TwilioProvider()
    elif provider_name == "sandbox":
        if settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxSMSProvider()
        raise SMSDeliveryError("Sandbox SMS provider is strictly disabled in production. Configure MSG91 or Twilio.")
    else:
        # Default is msg91
        if not settings.MSG91_AUTH_KEY and settings.is_sandbox_otp_allowed():
            return DevelopmentSandboxSMSProvider()
        return MSG91Provider()
