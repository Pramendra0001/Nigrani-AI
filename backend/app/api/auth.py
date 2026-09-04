"""Authentication and Identity Router for Nigrani AI."""

import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import User
from app.services.auth_service import AuthService
from app.utils.security import verify_access_token
from app.schemas.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    VerifyEmailOtpRequest,
    VerifyPhoneOtpRequest,
    ResendOtpRequest,
    GoogleAuthRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    UpdateProfileRequest,
    DeleteAccountRequest,
)

logger = logging.getLogger("nigrani.auth_router")
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication & Profile"])
auth_service = AuthService()


# -------------------------------------------------------------
# Dependency: Extract Current User from Bearer Token
# -------------------------------------------------------------
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extracts and validates JWT Bearer token from authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1].strip()
    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or no longer exists.",
        )

    return user


def require_role(allowed_roles: List[str]):
    """Role-based access control (RBAC) dependency factory."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}.",
            )
        return current_user
    return role_checker


# -------------------------------------------------------------
# 1. Registration, Login & Logout
# -------------------------------------------------------------
@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Registers a new user with duplicate prevention and OTP dispatch."""
    ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Web Client")
    try:
        res = await auth_service.register_user(
            db=db,
            full_name=req.full_name,
            email=req.email,
            phone=req.phone,
            password=req.password,
            organization=req.organization,
            designation=req.designation,
            ip_address=ip,
            user_agent=ua,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Error during user registration")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed. Please check inputs and try again.")


@auth_router.post("/login")
async def login(req: UserLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticates user via email/phone and password."""
    ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Web Client")
    try:
        res = await auth_service.login_user(
            db=db,
            identifier=req.identifier,
            password=req.password,
            ip_address=ip,
            user_agent=ua,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        logger.exception("Error during login")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed. Please try again.")


@auth_router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logs out user and invalidates client session."""
    return {"status": "success", "message": "Logged out successfully."}


@auth_router.get("/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile and verification status of current authenticated user."""
    return auth_service._user_dict(current_user)


# -------------------------------------------------------------
# 2. Email & Phone OTP Verification
# -------------------------------------------------------------
@auth_router.post("/verify-email-otp")
async def verify_email_otp(req: VerifyEmailOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verifies email OTP."""
    try:
        res = await auth_service.verify_email_otp(db=db, email=req.email, otp=req.otp)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.post("/verify-phone-otp")
async def verify_phone_otp(req: VerifyPhoneOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verifies phone OTP."""
    try:
        res = await auth_service.verify_phone_otp(db=db, phone=req.phone, otp=req.otp)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.post("/resend-otp")
async def resend_otp(req: ResendOtpRequest, db: AsyncSession = Depends(get_db)):
    """Resends OTP with cooldown enforcement."""
    try:
        res = await auth_service.resend_otp(db=db, target=req.target, code_type=req.code_type)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))


# -------------------------------------------------------------
# 3. Google OAuth Authentication
# -------------------------------------------------------------
@auth_router.post("/google")
async def google_auth(req: GoogleAuthRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticates or links Google OAuth identity."""
    ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Web Client")
    try:
        res = await auth_service.authenticate_google(
            db=db,
            credential_token=req.credential,
            user_agent=ua,
            ip_address=ip,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Error during Google OAuth authentication")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google authentication failed.")


# -------------------------------------------------------------
# 4. Password Recovery & Management
# -------------------------------------------------------------
@auth_router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Dispatches password reset OTP code."""
    try:
        res = await auth_service.forgot_password(db=db, email=req.email)
        return res
    except Exception as e:
        logger.exception("Error during forgot password")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Password recovery request failed.")


@auth_router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Resets user password using verified OTP code."""
    try:
        res = await auth_service.reset_password(db=db, email=req.email, otp=req.otp, new_password=req.new_password)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Changes password for authenticated user."""
    try:
        res = await auth_service.change_password(
            db=db,
            user_id=current_user.id,
            current_password=req.current_password,
            new_password=req.new_password,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# -------------------------------------------------------------
# 5. Profile & Settings Management
# -------------------------------------------------------------
@auth_router.put("/profile")
async def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates user profile details."""
    try:
        res = await auth_service.update_profile(
            db=db,
            user_id=current_user.id,
            full_name=req.full_name,
            organization=req.organization,
            designation=req.designation,
            avatar_url=req.avatar_url,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists all active login sessions/devices for user."""
    return await auth_service.list_sessions(db=db, user_id=current_user.id)


@auth_router.post("/sessions/revoke-others")
async def revoke_others(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revokes all other active sessions except current device."""
    return await auth_service.revoke_other_sessions(db=db, user_id=current_user.id)


# -------------------------------------------------------------
# 6. Danger Zone: Secure Account Deletion
# -------------------------------------------------------------
@auth_router.delete("/account")
async def delete_account(
    req: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently and securely deletes account with password confirmation."""
    try:
        res = await auth_service.delete_account(
            db=db,
            user_id=current_user.id,
            password_confirmation=req.password_confirmation,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
