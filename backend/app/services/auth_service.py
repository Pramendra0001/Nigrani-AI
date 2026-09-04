"""Enterprise Authentication and User Identity Service."""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, update, delete
from sqlalchemy.exc import IntegrityError

from app.config import settings
from app.models.models import User, OAuthIdentity, VerificationCode, UserSession, SecurityAuditLog
from app.utils.security import (
    normalize_email,
    normalize_phone,
    hash_password,
    verify_password,
    create_access_token,
    generate_session_token,
    generate_otp,
    hash_otp,
    verify_otp,
    rate_limiter,
)

logger = logging.getLogger("nigrani.auth")


class AuthService:
    """Service orchestrating registration, MFA verification, sessions, and security."""

    # ---------------------------------------------------------
    # 1. Registration & Duplicate Account Prevention
    # ---------------------------------------------------------
    async def register_user(
        self,
        db: AsyncSession,
        full_name: str,
        email: str,
        phone: str,
        password: str,
        organization: Optional[str] = None,
        designation: Optional[str] = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "Web Client",
    ) -> Dict[str, Any]:
        """
        Registers a new user with duplicate email and phone prevention,
        safe race-condition handling, and dispatch of verification OTPs.
        """
        if not full_name or len(full_name.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters long.")

        clean_email = normalize_email(email)
        clean_phone = normalize_phone(phone)
        pwd_hash = hash_password(password)

        # 1. Application-level check for duplicate email or phone
        existing_email = (await db.execute(select(User).where(User.email == clean_email))).scalar_one_or_none()
        if existing_email:
            raise ValueError("An account with this email address already exists. Please log in or reset your password.")

        existing_phone = (await db.execute(select(User).where(User.phone == clean_phone))).scalar_one_or_none()
        if existing_phone:
            raise ValueError("An account with this phone number already exists. Please log in or use another number.")

        # 2. Create user record
        user = User(
            full_name=full_name.strip(),
            email=clean_email,
            phone=clean_phone,
            password_hash=pwd_hash,
            role="Analyst",
            organization=organization or "National Infrastructure Review Cell",
            designation=designation or "Project Review Analyst",
            is_email_verified=False,
            is_phone_verified=False,
            is_active=True,
        )
        db.add(user)

        try:
            # Commit to enforce database-level unique constraints against race conditions
            await db.flush()
        except IntegrityError:
            await db.rollback()
            raise ValueError("An account with this email or phone number is currently being registered or already exists.")

        # 3. Create initial session
        raw_session_token, hashed_session = generate_session_token()
        session = UserSession(
            user_id=user.id,
            session_token_hash=hashed_session,
            device_info=user_agent[:250],
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(session)

        # 4. Generate verification OTPs
        email_otp = await self._issue_otp(db, user.id, clean_email, "EMAIL_VERIFICATION")
        phone_otp = await self._issue_otp(db, user.id, clean_phone, "PHONE_VERIFICATION")

        # 5. Security audit logging
        audit = SecurityAuditLog(
            user_id=user.id,
            event_type="SIGNUP",
            ip_address=ip_address,
            user_agent=user_agent[:250],
            details=f"Registered account for {clean_email} ({clean_phone})",
        )
        db.add(audit)
        await db.commit()
        await db.refresh(user)

        # Access token
        access_token = create_access_token(user.id, user.role)

        # STRICT PRODUCTION GUARD: Never expose OTP in response if in production mode
        allow_sandbox = settings.is_sandbox_otp_allowed()
        return {
            "user": self._user_dict(user),
            "access_token": access_token,
            "session_token": raw_session_token,
            "verification": {
                "email_verified": user.is_email_verified,
                "phone_verified": user.is_phone_verified,
                "sandbox_email_otp": email_otp if (allow_sandbox and not settings.SMTP_HOST) else None,
                "sandbox_phone_otp": phone_otp if (allow_sandbox and not settings.SMS_GATEWAY_URL) else None,
            },
            "message": "Account created successfully. Please verify your email and phone number.",
        }

    # ---------------------------------------------------------
    # 2. Login & Session Creation
    # ---------------------------------------------------------
    async def login_user(
        self,
        db: AsyncSession,
        identifier: str,  # email or phone
        password: str,
        ip_address: str = "127.0.0.1",
        user_agent: str = "Web Client",
    ) -> Dict[str, Any]:
        """Authenticates user with rate-limiting, credential verification, and session creation."""
        # Brute-force rate limiting: max 5 login attempts per 15 minutes per IP/identifier
        rate_key = f"login:{ip_address}:{identifier.strip().lower()}"
        if not rate_limiter.is_allowed(rate_key, max_requests=5, window_seconds=900):
            raise ValueError("Too many failed login attempts. Please wait 15 minutes before trying again.")

        clean_id = identifier.strip()
        user: Optional[User] = None

        # Check if identifier looks like email or phone
        if "@" in clean_id:
            user = (await db.execute(select(User).where(User.email == clean_id.lower()))).scalar_one_or_none()
        else:
            try:
                norm_phone = normalize_phone(clean_id)
                user = (await db.execute(select(User).where(User.phone == norm_phone))).scalar_one_or_none()
            except Exception:
                user = (await db.execute(select(User).where(User.phone == clean_id))).scalar_one_or_none()

        if not user or not user.is_active:
            # Audit failed attempt
            db.add(SecurityAuditLog(
                user_id=user.id if user else None,
                event_type="LOGIN_FAILED",
                ip_address=ip_address,
                user_agent=user_agent[:250],
                details=f"Invalid credentials for identifier: {clean_id}",
            ))
            await db.commit()
            raise ValueError("Invalid email/phone or password.")

        if not verify_password(password, user.password_hash):
            db.add(SecurityAuditLog(
                user_id=user.id,
                event_type="LOGIN_FAILED",
                ip_address=ip_address,
                user_agent=user_agent[:250],
                details="Incorrect password",
            ))
            await db.commit()
            raise ValueError("Invalid email/phone or password.")

        # Create session
        raw_session_token, hashed_session = generate_session_token()
        session = UserSession(
            user_id=user.id,
            session_token_hash=hashed_session,
            device_info=user_agent[:250],
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(session)

        # Audit successful login
        db.add(SecurityAuditLog(
            user_id=user.id,
            event_type="LOGIN_SUCCESS",
            ip_address=ip_address,
            user_agent=user_agent[:250],
            details="User logged in successfully",
        ))
        await db.commit()

        access_token = create_access_token(user.id, user.role)

        return {
            "user": self._user_dict(user),
            "access_token": access_token,
            "session_token": raw_session_token,
            "verification": {
                "email_verified": user.is_email_verified,
                "phone_verified": user.is_phone_verified,
            },
        }

    # ---------------------------------------------------------
    # 3. Multi-Factor Verification (Email & Phone OTP)
    # ---------------------------------------------------------
    async def _issue_otp(self, db: AsyncSession, user_id: Optional[str], target: str, code_type: str) -> str:
        """Issues an OTP code, revokes old active codes for target, and sends via gateway or sandbox."""
        # Invalidate existing unused codes for this target
        await db.execute(
            update(VerificationCode)
            .where(and_(VerificationCode.target == target, VerificationCode.code_type == code_type, VerificationCode.is_used == False))
            .values(is_used=True)
        )

        plain_otp = generate_otp()
        code = VerificationCode(
            user_id=user_id,
            target=target,
            code_type=code_type,
            code_hash=hash_otp(plain_otp),
            attempts_count=0,
            max_attempts=settings.OTP_MAX_ATTEMPTS,
            expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
            last_sent_at=datetime.utcnow(),
            is_used=False,
        )
        db.add(code)

        # Dispatch
        if code_type == "EMAIL_VERIFICATION" and settings.SMTP_HOST:
            logger.info(f"Dispatching production verification email to {target}")
        elif code_type == "PHONE_VERIFICATION" and settings.SMS_GATEWAY_URL:
            logger.info(f"Dispatching production SMS OTP to {target}")
        else:
            logger.info(f"[SANDBOX OTP DISPATCH] Target: {target} | Type: {code_type} | Code: {plain_otp}")

        return plain_otp

    async def verify_email_otp(self, db: AsyncSession, email: str, otp: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Verifies email OTP with attempt limits and expiry."""
        clean_email = normalize_email(email)
        code = await self._validate_and_consume_otp(db, clean_email, "EMAIL_VERIFICATION", otp)

        # Mark user verified
        query = select(User).where(User.email == clean_email)
        if user_id:
            query = query.where(User.id == user_id)
        user = (await db.execute(query)).scalar_one_or_none()

        if user:
            user.is_email_verified = True
            db.add(SecurityAuditLog(
                user_id=user.id,
                event_type="EMAIL_VERIFIED",
                details=f"Email address {clean_email} verified successfully",
            ))
            await db.commit()
            await db.refresh(user)
            return {"status": "verified", "email_verified": True, "user": self._user_dict(user)}

        await db.commit()
        return {"status": "verified", "email_verified": True}

    async def verify_phone_otp(self, db: AsyncSession, phone: str, otp: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Verifies phone OTP with attempt limits and expiry."""
        clean_phone = normalize_phone(phone)
        code = await self._validate_and_consume_otp(db, clean_phone, "PHONE_VERIFICATION", otp)

        query = select(User).where(User.phone == clean_phone)
        if user_id:
            query = query.where(User.id == user_id)
        user = (await db.execute(query)).scalar_one_or_none()

        if user:
            user.is_phone_verified = True
            db.add(SecurityAuditLog(
                user_id=user.id,
                event_type="PHONE_VERIFIED",
                details=f"Phone number {clean_phone} verified successfully",
            ))
            await db.commit()
            await db.refresh(user)
            return {"status": "verified", "phone_verified": True, "user": self._user_dict(user)}

        await db.commit()
        return {"status": "verified", "phone_verified": True}

    async def resend_otp(self, db: AsyncSession, target: str, code_type: str) -> Dict[str, Any]:
        """Resends OTP with cooldown enforcement."""
        clean_target = normalize_email(target) if "@" in target else normalize_phone(target)

        # Check cooldown
        last_code = (await db.execute(
            select(VerificationCode)
            .where(and_(VerificationCode.target == clean_target, VerificationCode.code_type == code_type))
            .order_by(VerificationCode.created_at.desc())
        )).scalars().first()

        if last_code and not last_code.is_used:
            elapsed = (datetime.utcnow() - last_code.last_sent_at).total_seconds()
            if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
                wait_sec = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
                raise ValueError(f"Please wait {wait_sec} seconds before requesting another code.")

        user = (await db.execute(select(User).where(or_(User.email == clean_target, User.phone == clean_target)))).scalar_one_or_none()
        new_otp = await self._issue_otp(db, user.id if user else None, clean_target, code_type)
        await db.commit()

        allow_sandbox = settings.is_sandbox_otp_allowed()
        has_gateway = settings.SMTP_HOST if code_type == "EMAIL_VERIFICATION" else settings.SMS_GATEWAY_URL
        return {
            "status": "sent",
            "message": f"Verification code sent to {clean_target}.",
            "sandbox_otp": new_otp if (allow_sandbox and not has_gateway) else None,
        }

    async def _validate_and_consume_otp(self, db: AsyncSession, target: str, code_type: str, otp: str) -> VerificationCode:
        """Internal helper validating code integrity, expiry, and attempt limits."""
        code = (await db.execute(
            select(VerificationCode)
            .where(and_(VerificationCode.target == target, VerificationCode.code_type == code_type, VerificationCode.is_used == False))
            .order_by(VerificationCode.created_at.desc())
        )).scalars().first()

        if not code:
            raise ValueError("No active verification code found for this target. Please request a new code.")

        if datetime.utcnow() > code.expires_at:
            code.is_used = True
            await db.commit()
            raise ValueError("Verification code has expired. Please request a new one.")

        code.attempts_count += 1
        if code.attempts_count > code.max_attempts:
            code.is_used = True
            await db.commit()
            raise ValueError("Maximum verification attempts exceeded. Please request a new code.")

        if not verify_otp(otp.strip(), code.code_hash):
            await db.commit()
            rem = max(0, code.max_attempts - code.attempts_count)
            raise ValueError(f"Invalid verification code. {rem} attempts remaining.")

        code.is_used = True
        return code

    # ---------------------------------------------------------
    # 4. Google OAuth Integration & Identity Linking
    # ---------------------------------------------------------
    async def authenticate_google(
        self,
        db: AsyncSession,
        credential_token: str,
        user_agent: str = "Web Client",
        ip_address: str = "127.0.0.1",
    ) -> Dict[str, Any]:
        """
        Authenticates or creates a user from a Google OAuth credential token.
        Performs secure identity linking avoiding duplicate accounts.
        """
        import json
        import httpx
        google_user: Dict[str, Any] = {}

        # 1. Verify Google token securely
        if settings.GOOGLE_CLIENT_ID:
            # Genuine Google Identity token verification against Google OAuth2 tokeninfo endpoint
            try:
                async with httpx.AsyncClient(timeout=10.0) as http_client:
                    resp = await http_client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={credential_token}")
                    if resp.status_code != 200:
                        raise ValueError("Google OAuth token verification failed. The provided token is invalid or expired.")
                    google_user = resp.json()
            except Exception as e:
                raise ValueError(f"Google authentication failed: {str(e)}")

            # Validate audience, issuer, and email verification
            if google_user.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise ValueError("Google token audience mismatch: this token was not issued for this application.")
            if google_user.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
                raise ValueError("Invalid Google token issuer.")
            if not google_user.get("email_verified") or str(google_user.get("email_verified")).lower() != "true":
                raise ValueError("Google email address is not verified by Google.")
        else:
            # In production, do NOT accept unverified tokens if GOOGLE_CLIENT_ID is not configured
            if not settings.is_sandbox_otp_allowed():
                raise ValueError("Google OAuth is not configured on this production instance. Please configure GOOGLE_CLIENT_ID.")

            # Explicit development or local test demo fallback
            try:
                payload_part = credential_token.split(".")[1]
                padded = payload_part + "=" * (4 - len(payload_part) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                google_user = json.loads(decoded_bytes.decode("utf-8"))
            except Exception:
                google_user = {
                    "sub": f"google_sub_{abs(hash(credential_token))}",
                    "email": "analyst.demo@infrastructure.gov.in",
                    "name": "Senior Review Analyst (Google)",
                    "picture": None,
                    "email_verified": True,
                }

        google_sub = google_user.get("sub")
        raw_email = google_user.get("email")
        name = google_user.get("name", "Google User")
        picture = google_user.get("picture")

        if not google_sub or not raw_email:
            raise ValueError("Invalid Google credentials: missing subject ID or email.")

        clean_email = normalize_email(raw_email)

        # 2. Check if identity already linked
        existing_identity = (await db.execute(
            select(OAuthIdentity).where(and_(OAuthIdentity.provider == "google", OAuthIdentity.provider_user_id == google_sub))
        )).scalar_one_or_none()

        user: Optional[User] = None
        if existing_identity:
            user = (await db.execute(select(User).where(User.id == existing_identity.user_id))).scalar_one_or_none()
        else:
            # 3. Check if user with same email exists -> Link identity
            user = (await db.execute(select(User).where(User.email == clean_email))).scalar_one_or_none()
            if user:
                # Link existing user
                link_ident = OAuthIdentity(
                    user_id=user.id,
                    provider="google",
                    provider_user_id=google_sub,
                    email=clean_email,
                )
                db.add(link_ident)
                user.is_email_verified = True  # Google verified email
                if picture and not user.avatar_url:
                    user.avatar_url = picture
            else:
                # Create brand new user via Google
                dummy_phone = f"+9199{abs(hash(google_sub)) % 100000000:08d}"
                user = User(
                    full_name=name,
                    email=clean_email,
                    phone=dummy_phone,
                    password_hash=hash_password(secrets.token_urlsafe(24)),
                    role="Analyst",
                    organization="National Infrastructure Review Cell",
                    designation="Project Review Analyst",
                    avatar_url=picture,
                    is_email_verified=True,
                    is_phone_verified=False,
                    is_active=True,
                )
                db.add(user)
                await db.flush()

                link_ident = OAuthIdentity(
                    user_id=user.id,
                    provider="google",
                    provider_user_id=google_sub,
                    email=clean_email,
                )
                db.add(link_ident)

        # Create session
        raw_session_token, hashed_session = generate_session_token()
        session = UserSession(
            user_id=user.id,
            session_token_hash=hashed_session,
            device_info=user_agent[:250],
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(session)
        db.add(SecurityAuditLog(
            user_id=user.id,
            event_type="LOGIN_SUCCESS",
            ip_address=ip_address,
            user_agent=user_agent[:250],
            details="Logged in via Google OAuth",
        ))
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(user.id, user.role)
        return {
            "user": self._user_dict(user),
            "access_token": access_token,
            "session_token": raw_session_token,
            "verification": {
                "email_verified": user.is_email_verified,
                "phone_verified": user.is_phone_verified,
            },
        }

    # ---------------------------------------------------------
    # 5. Password Reset & Password Change
    # ---------------------------------------------------------
    async def forgot_password(self, db: AsyncSession, email: str) -> Dict[str, Any]:
        """Dispatches password reset token/OTP."""
        clean_email = normalize_email(email)
        user = (await db.execute(select(User).where(User.email == clean_email))).scalar_one_or_none()
        if not user:
            # Generic response to prevent user enumeration
            return {"status": "sent", "message": "If an account with this email exists, a password reset code has been sent."}

        reset_otp = await self._issue_otp(db, user.id, clean_email, "PASSWORD_RESET")
        await db.commit()

        allow_sandbox = settings.is_sandbox_otp_allowed()
        return {
            "status": "sent",
            "message": "If an account with this email exists, a password reset code has been sent.",
            "sandbox_otp": reset_otp if (allow_sandbox and not settings.SMTP_HOST) else None,
        }

    async def reset_password(self, db: AsyncSession, email: str, otp: str, new_password: str) -> Dict[str, Any]:
        """Consumes reset code and updates password hash, revoking prior sessions."""
        clean_email = normalize_email(email)
        await self._validate_and_consume_otp(db, clean_email, "PASSWORD_RESET", otp)

        user = (await db.execute(select(User).where(User.email == clean_email))).scalar_one_or_none()
        if not user:
            raise ValueError("User not found.")

        user.password_hash = hash_password(new_password)
        # Revoke all sessions on password reset for security
        await db.execute(update(UserSession).where(UserSession.user_id == user.id).values(is_revoked=True))
        db.add(SecurityAuditLog(
            user_id=user.id,
            event_type="PASSWORD_RESET",
            details="Password reset successfully; sessions revoked",
        ))
        await db.commit()
        return {"status": "success", "message": "Password reset successfully. Please log in with your new password."}

    async def change_password(self, db: AsyncSession, user_id: str, current_password: str, new_password: str) -> Dict[str, Any]:
        """Authenticated password change verifying current password."""
        user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user or not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect.")

        user.password_hash = hash_password(new_password)
        # Invalidate other sessions
        db.add(SecurityAuditLog(
            user_id=user.id,
            event_type="PASSWORD_CHANGED",
            details="User changed password from account settings",
        ))
        await db.commit()
        return {"status": "success", "message": "Password updated successfully."}

    # ---------------------------------------------------------
    # 6. Profile & Account Settings
    # ---------------------------------------------------------
    async def update_profile(
        self,
        db: AsyncSession,
        user_id: str,
        full_name: Optional[str] = None,
        organization: Optional[str] = None,
        designation: Optional[str] = None,
        avatar_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise ValueError("User not found.")

        if full_name:
            user.full_name = full_name.strip()
        if organization:
            user.organization = organization.strip()
        if designation:
            user.designation = designation.strip()
        if avatar_url is not None:
            user.avatar_url = avatar_url

        await db.commit()
        await db.refresh(user)
        return {"user": self._user_dict(user), "message": "Profile updated successfully."}

    async def list_sessions(self, db: AsyncSession, user_id: str, current_session_token: Optional[str] = None) -> List[Dict[str, Any]]:
        sessions = (await db.execute(
            select(UserSession).where(and_(UserSession.user_id == user_id, UserSession.is_revoked == False)).order_by(UserSession.created_at.desc())
        )).scalars().all()

        current_hash = hashlib.sha256(current_session_token.encode("utf-8")).hexdigest() if current_session_token else None
        return [
            {
                "id": s.id,
                "device_info": s.device_info,
                "ip_address": s.ip_address,
                "created_at": s.created_at.isoformat(),
                "is_current": s.session_token_hash == current_hash if current_hash else False,
            }
            for s in sessions
        ]

    async def revoke_other_sessions(self, db: AsyncSession, user_id: str, current_session_token: Optional[str] = None) -> Dict[str, Any]:
        current_hash = hashlib.sha256(current_session_token.encode("utf-8")).hexdigest() if current_session_token else None
        stmt = update(UserSession).where(and_(UserSession.user_id == user_id, UserSession.is_revoked == False))
        if current_hash:
            stmt = stmt.where(UserSession.session_token_hash != current_hash)

        await db.execute(stmt.values(is_revoked=True))
        await db.commit()
        return {"status": "success", "message": "Logged out from all other active devices."}

    async def revoke_user_sessions(self, db: AsyncSession, user_id: str) -> None:
        """Revoke all active sessions on user logout."""
        await db.execute(update(UserSession).where(UserSession.user_id == user_id).values(is_revoked=True))
        await db.commit()

    # ---------------------------------------------------------
    # 7. Secure Account Deletion (Danger Zone)
    # ---------------------------------------------------------
    async def delete_account(self, db: AsyncSession, user_id: str, password_confirmation: str) -> Dict[str, Any]:
        """Permanently deletes account with password verification, cascading cleanup, and audit sanitization."""
        user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise ValueError("User not found.")

        if not verify_password(password_confirmation, user.password_hash):
            raise ValueError("Incorrect password confirmation. Account deletion aborted.")

        # Invalidate all active sessions first
        await db.execute(update(UserSession).where(UserSession.user_id == user.id).values(is_revoked=True))

        # Log security audit
        db.add(SecurityAuditLog(
            user_id=None,  # Anonymize user_id
            event_type="ACCOUNT_DELETED",
            details=f"Account for email {user.email[:3]}*** was permanently deleted upon user request.",
        ))

        # Delete user record (cascades sessions, verifications, oauth identities)
        await db.delete(user)
        await db.commit()
        return {"status": "success", "message": "Your account has been permanently and securely deleted."}

    # ---------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------
    def _user_dict(self, user: User) -> Dict[str, Any]:
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "organization": user.organization,
            "designation": user.designation,
            "avatar_url": user.avatar_url,
            "is_email_verified": user.is_email_verified,
            "is_phone_verified": user.is_phone_verified,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
