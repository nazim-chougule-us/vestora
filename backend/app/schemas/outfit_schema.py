"""
Vestora Backend — Outfit schemas (Pydantic v2).
"""

from pydantic import BaseModel


class OutfitGenerateRequest(BaseModel):
    occasion: str                          # e.g. "Work", "Date Night", "Casual"
    mood: str | None = None                # e.g. "Confident", "Relaxed"
    dress_code: str | None = None          # e.g. "Smart Casual", "Black Tie"
    location: str | None = None            # e.g. "Dubai"
    notes: str | None = None               # Any extra context


class OutfitItemRef(BaseModel):
    item_id: str
    category: str = ""
    image_url: str = ""


class OutfitResponse(BaseModel):
    id: str
    user_id: str
    occasion: str
    mood: str | None = None
    dress_code: str | None = None
    items: list[OutfitItemRef] = []
    reasoning: str = ""
    confidence_boost: str = ""
    styling_tips: list[str] = []
    weather_note: str | None = None
    preferences_applied: list[str] = []
    created_at: str = ""


class OutfitListResponse(BaseModel):
    outfits: list[OutfitResponse]
    total: int
