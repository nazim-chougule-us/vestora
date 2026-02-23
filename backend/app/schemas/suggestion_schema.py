"""
Vestora Backend — Outfit Suggestion schemas (Pydantic v2).
"""

from pydantic import BaseModel, Field


class SuggestionRequest(BaseModel):
    occasion: str = Field(..., min_length=1, max_length=200)
    style: str = ""                   # e.g. "streetwear", "minimalist", "classic"
    budget: str = ""                  # e.g. "under $100", "mid-range", "luxury"
    season: str = ""                  # e.g. "summer", "winter"
    gender: str = ""                  # override — auto-filled from profile if empty
    notes: str = ""                   # free-form extra requirements


class SuggestionOutfit(BaseModel):
    title: str = ""
    items: list[str] = []             # list of item descriptions
    why_it_works: str = ""
    styling_tips: list[str] = []
    estimated_budget: str = ""
    trend_source: str = ""            # where the trend comes from
    confidence_note: str = ""
    image_key: str = ""               # S3 key for generated outfit image
    image_url: str = ""               # signed URL for the image


class SuggestionResponse(BaseModel):
    id: str
    user_id: str
    query: dict = {}                  # the original request params
    outfits: list[SuggestionOutfit] = []
    trending_context: str = ""        # summary of what's trending
    created_at: str = ""


class SuggestionListResponse(BaseModel):
    suggestions: list[SuggestionResponse]
    total: int
