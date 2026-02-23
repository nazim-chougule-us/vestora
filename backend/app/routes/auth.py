"""
Vestora Backend — Auth routes: OTP send/verify, Google OAuth, refresh, me, logout.
No password-based authentication. Fully production-ready.
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status, Response, Depends
from app.database import users_collection, otps_collection
from app.schemas.auth_schema import (
    OTPSendRequest, OTPVerifyRequest, GoogleAuthRequest,
    RefreshRequest, TokenResponse, UserResponse,
)
from app.utils.security import (
    generate_otp, hash_otp, verify_otp,
    create_access_token, create_refresh_token,
    decode_refresh_token,
)
from app.utils.helpers import utc_now
from app.config import settings
from app.dependencies import get_current_user
from app.services.email_service import send_otp_email

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_access_cookie(response: Response, access_token: str) -> None:
    """Set the httpOnly access token cookie with environment-aware security."""
    is_prod = settings.environment == "production"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax" if not is_prod else "none",
        secure=is_prod,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        path="/",
    )


async def _issue_tokens(user_id: str, response: Response, is_new_user: bool = False) -> TokenResponse:
    """Create access + refresh tokens, set cookie, return response."""
    access_token = create_access_token(subject=user_id)
    refresh_token = create_refresh_token(subject=user_id)
    _set_access_cookie(response, access_token)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        is_new_user=is_new_user,
    )


async def _find_or_create_user(
    email: str,
    name: str,
    auth_provider: str,
    google_id: str | None = None,
    gender: str | None = None,
) -> tuple[str, bool]:
    """
    Find existing user by email or create a new one.
    Returns (user_id_str, is_new_user).
    """
    col = users_collection()
    user = await col.find_one({"email": email})

    if user:
        # Update auth_provider if user switched methods (e.g. OTP user now uses Google)
        update: dict = {}
        if google_id and not user.get("google_id"):
            update["google_id"] = google_id
        if update:
            await col.update_one({"_id": user["_id"]}, {"$set": update})
        return str(user["_id"]), False

    # New user
    user_doc = {
        "email": email,
        "name": name or email.split("@")[0],
        "auth_provider": auth_provider,
        "google_id": google_id,
        "gender": gender,
        "body_profile": None,
        "style_preferences": None,
        "cultural_preferences": None,
        "theme": "midnight",
        "created_at": utc_now().isoformat(),
    }
    result = await col.insert_one(user_doc)
    return str(result.inserted_id), True


# ---------------------------------------------------------------------------
# OTP Endpoints
# ---------------------------------------------------------------------------

@router.post("/otp/send")
async def otp_send(body: OTPSendRequest):
    """
    Send a 6-digit OTP to the user's email.
    Rate-limited to prevent abuse.
    """
    email = body.email.lower().strip()
    col = otps_collection()

    # Rate limit: max N OTPs per email per hour
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    recent_count = await col.count_documents({
        "email": email,
        "created_at": {"$gte": one_hour_ago},
    })
    if recent_count >= settings.otp_rate_limit_per_hour:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later.",
        )

    # Generate and store hashed OTP
    otp_code = generate_otp()
    otp_doc = {
        "email": email,
        "otp_hash": hash_otp(otp_code),
        "attempts": 0,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes),
    }
    await col.insert_one(otp_doc)

    # Send email (async, non-blocking)
    sent = await send_otp_email(email, otp_code)
    if not sent and settings.environment == "production":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send OTP email. Please try again.",
        )

    return {
        "message": "OTP sent to your email",
        "expires_in_seconds": settings.otp_expire_minutes * 60,
    }


@router.post("/otp/verify", response_model=TokenResponse)
async def otp_verify(body: OTPVerifyRequest, response: Response):
    """
    Verify OTP and authenticate. Creates user account if new.
    Returns JWT tokens on success.
    """
    email = body.email.lower().strip()
    col = otps_collection()

    # Find the latest unexpired OTP for this email
    otp_doc = await col.find_one(
        {
            "email": email,
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        },
        sort=[("created_at", -1)],
    )

    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired or not found. Please request a new one.",
        )

    # Check max verification attempts
    if otp_doc.get("attempts", 0) >= settings.otp_max_attempts:
        # Invalidate this OTP
        await col.delete_one({"_id": otp_doc["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts. Please request a new OTP.",
        )

    # Verify OTP
    if not verify_otp(body.otp, otp_doc["otp_hash"]):
        # Increment attempts
        await col.update_one(
            {"_id": otp_doc["_id"]},
            {"$inc": {"attempts": 1}},
        )
        remaining = settings.otp_max_attempts - otp_doc.get("attempts", 0) - 1
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid OTP. {remaining} attempt(s) remaining.",
        )

    # OTP verified — delete all OTPs for this email
    await col.delete_many({"email": email})

    # Find or create user
    user_id, is_new = await _find_or_create_user(
        email=email,
        name=body.name,
        auth_provider="otp",
        gender=body.gender,
    )

    return await _issue_tokens(user_id, response, is_new_user=is_new)


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, response: Response):
    """
    Authenticate with a Google ID token.
    Verifies the token with Google, creates user if new, returns JWT tokens.
    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured.",
        )

    # Verify Google ID token
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        idinfo = google_id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )

    # Extract user info from verified token
    google_email = idinfo.get("email")
    if not google_email or not idinfo.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email not verified.",
        )

    google_name = idinfo.get("name", "")
    google_sub = idinfo.get("sub", "")

    # Find or create user
    user_id, is_new = await _find_or_create_user(
        email=google_email.lower(),
        name=google_name,
        auth_provider="google",
        google_id=google_sub,
    )

    return await _issue_tokens(user_id, response, is_new_user=is_new)


# ---------------------------------------------------------------------------
# Me / Refresh / Logout
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current authenticated user."""
    return UserResponse(
        id=current_user["_id"] if isinstance(current_user["_id"], str) else str(current_user["_id"]),
        email=current_user["email"],
        name=current_user["name"],
        gender=current_user.get("gender"),
        body_profile=current_user.get("body_profile"),
        style_preferences=current_user.get("style_preferences"),
        cultural_preferences=current_user.get("cultural_preferences"),
        theme=current_user.get("theme", "midnight"),
        auth_provider=current_user.get("auth_provider", "otp"),
        created_at=current_user.get("created_at"),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, response: Response):
    """Exchange a valid refresh token for new access + refresh tokens."""
    payload = decode_refresh_token(body.refresh_token)
    user_id = payload["sub"]

    access_token = create_access_token(subject=user_id)
    new_refresh = create_refresh_token(subject=user_id)
    _set_access_cookie(response, access_token)

    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout")
async def logout(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}
