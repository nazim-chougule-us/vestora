"""
Vestora Backend — Wardrobe item schemas (Pydantic v2).
One document per uploaded image; detected_items holds every garment the AI found.
"""

from pydantic import BaseModel, Field


class AIAttributes(BaseModel):
    category: str = ""           # e.g. "T-Shirt", "Blazer", "Sneakers"
    subcategory: str = ""        # e.g. "Crew Neck", "Double-Breasted"
    primary_color: str = ""
    secondary_color: str = ""
    fabric: str = ""             # e.g. "Cotton", "Linen", "Polyester"
    pattern: str = ""            # e.g. "Solid", "Striped", "Plaid"
    fit: str = ""                # e.g. "Slim", "Regular", "Oversized"
    brand: str = ""
    condition: str = ""          # e.g. "New", "Good", "Worn"
    season: list[str] = []       # e.g. ["Spring", "Summer"]
    occasion: list[str] = []     # e.g. ["Casual", "Work"]
    formality_score: int = 5     # 1 (very casual) to 10 (black tie)


class WardrobeItemUpdate(BaseModel):
    notes: str | None = None
    purchase_price: float | None = None
    tags: list[str] | None = None


class WardrobeItemResponse(BaseModel):
    id: str
    user_id: str
    image_key: str
    image_url: str = ""          # Signed URL, populated at response time
    detected_items: list[AIAttributes] = []
    notes: str = ""
    purchase_price: float | None = None
    tags: list[str] = []
    wear_count: int = 0
    cost_per_wear: float | None = None
    last_worn_at: str | None = None
    wear_dates: list[str] = []
    ai_analyzed: bool = False
    created_at: str = ""


class WardrobeListResponse(BaseModel):
    items: list[WardrobeItemResponse]
    total: int
