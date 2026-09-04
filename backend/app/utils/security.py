"""Enterprise security utilities: PBKDF2 hashing, HMAC tokens, OTPs, phone & email normalization."""

import re
import hmac
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from app.config import settings


# -------------------------------------------------------------
# 1. Normalization & Validation
# -------------------------------------------------------------
def normalize_email(email: str) -> str:
    """Normalize and validate email to lowercased trimmed RFC representation."""
    cleaned = email.strip().lower()
    regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(regex, cleaned):
        raise ValueError("Invalid email address format.")
    return cleaned


def normalize_phone(phone: str) -> str:
    """
    Normalize phone number to international E.164 format.
    Supports Indian formats (+91, 0, 10-digit) and standard global country prefixes.
    """
    cleaned = re.sub(r"[\s\-\(\)]", "", phone.strip())
    if not cleaned:
        raise ValueError("Phone number cannot be empty.")

    # If 10 digits without prefix (common Indian mobile format), default to +91
    if re.match(r"^[6-9]\d{9}$", cleaned):
        return f"+91{cleaned}"

    # If starts with leading 0 (national trunk) followed by 10 digits
    if re.match(r"^0[6-9]\d{9}$", cleaned):
        return f"+91{cleaned[1:]}"

    # If already starts with + and contains 10-15 digits
    if re.match(r"^\+\d{10,15}$", cleaned):
        return cleaned

    # If digits only with country code (e.g. 919876543210)
    if re.match(r"^\d{11,15}$", cleaned):
        return f"+{cleaned}"

    raise ValueError("Invalid phone number format. Please provide a valid 10-digit mobile number or E.164 international format (e.g. +919876543210).")


# -------------------------------------------------------------
# 2. Cryptographic Password Hashing (OWASP PBKDF2-SHA256)
# -------------------------------------------------------------
def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 600,000 iterations and cryptographically random salt."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 600000)
    b64_salt = base64.b64encode(salt).decode("ascii")
    b64_key = base64.b64encode(key).decode("ascii")
    return f"pbkdf2:sha256:600000${b64_salt}${b64_key}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password in constant time against PBKDF2 stored hash."""
    try:
        parts = stored_hash.split("$")
        if len(parts) != 3:
            return False
        meta, b64_salt, b64_key = parts
        _, algo, iters_str = meta.split(":")
        iters = int(iters_str)
        salt = base64.b64decode(b64_salt)
        expected_key = base64.b64decode(b64_key)
        computed_key = hashlib.pbkdf2_hmac(algo, plain_password.encode("utf-8"), salt, iters)
        return hmac.compare_digest(computed_key, expected_key)
    except Exception:
        return False


# -------------------------------------------------------------
# 3. Secure Token & Session Management (HMAC-SHA256 Signed Tokens)
# -------------------------------------------------------------
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ""
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_id: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generate tamper-proof signed access token with user_id, role, and expiry."""
    import json
    expires = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(expires.timestamp()),
        "iat": int(datetime.utcnow().timestamp()),
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64_encode(payload_bytes)

    sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)
    return f"{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> Optional[Dict[str, str]]:
    """Verify access token signature and expiration in constant time."""
    import json
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig_b64 = parts
        expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Check expiration
        exp = payload.get("exp")
        if not exp or datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None


def generate_session_token() -> Tuple[str, str]:
    """Return (raw_session_token, hashed_session_token)."""
    raw = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return raw, hashed


# -------------------------------------------------------------
# 4. Cryptographic OTP Management
# -------------------------------------------------------------
def generate_otp() -> str:
    """Generate cryptographically secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def hash_otp(otp: str) -> str:
    """Hash OTP value with app secret key to prevent plaintext exposure in DB."""
    return hmac.new(settings.SECRET_KEY.encode("utf-8"), otp.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_otp(plain_otp: str, stored_hash: str) -> bool:
    """Constant-time OTP verification."""
    computed = hash_otp(plain_otp)
    return hmac.compare_digest(computed, stored_hash)


# -------------------------------------------------------------
# 5. In-Memory Rate Limiter (Brute-Force & OTP Spam Prevention)
# -------------------------------------------------------------
class InMemoryRateLimiter:
    """Sliding-window rate limiter for sensitive authentication endpoints."""

    def __init__(self):
        self._records: Dict[str, list] = {}

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=window_seconds)

        # Cleanup old entries
        times = [t for t in self._records.get(key, []) if t > cutoff]
        if len(times) >= max_requests:
            self._records[key] = times
            return False

        times.append(now)
        self._records[key] = times
        return True


rate_limiter = InMemoryRateLimiter()
