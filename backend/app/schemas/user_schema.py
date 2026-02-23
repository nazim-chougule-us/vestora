"""
Vestora Backend — User profile request/response schemas (Pydantic v2).
"""

from pydantic import BaseModel, Field


class BodyProfile(BaseModel):
    height_cm: float | None = None
    weight_kg: float | None = None
    skin_tone: str | None = None
    body_type: str | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    hip_cm: float | None = None
    shoe_size: str | None = None


class StylePreferences(BaseModel):
    favorite_colors: list[str] = []
    avoided_colors: list[str] = []
    preferred_fits: list[str] = []
    preferred_styles: list[str] = []
    comfort_level: str = "moderate"  # minimal, moderate, adventurous


class CulturalPreferences(BaseModel):
    modesty_level: str = "standard"  # standard, conservative, liberal
    cultural_tags: list[str] = []


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    gender: str | None = None  # "male" | "female"
    body_profile: BodyProfile | None = None
    style_preferences: StylePreferences | None = None
    cultural_preferences: CulturalPreferences | None = None
    theme: str | None = None


class ProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    gender: str | None = None
    body_profile: BodyProfile | None = None
    style_preferences: StylePreferences | None = None
    cultural_preferences: CulturalPreferences | None = None
    theme: str = "midnight"
    created_at: str | None = None
