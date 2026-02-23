"""
Vestora Backend — Auth request/response schemas (Pydantic v2).
OTP-based authentication + Google OAuth. No passwords.
"""

from typing import Any
from pydantic import BaseModel, EmailStr, Field


class OTPSendRequest(BaseModel):
    email: EmailStr


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    name: str = Field("", max_length=100)
    gender: str | None = None  # "male" | "female"


class GoogleAuthRequest(BaseModel):
    id_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    gender: str | None = None
    body_profile: dict[str, Any] | None = None
    style_preferences: dict[str, Any] | None = None
    cultural_preferences: dict[str, Any] | None = None
    theme: str = "midnight"
    auth_provider: str = "otp"
    created_at: str | None = None
