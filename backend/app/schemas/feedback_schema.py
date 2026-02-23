"""
Vestora Backend — Outfit feedback schemas (Pydantic v2).
"""

from pydantic import BaseModel, Field


class FeedbackCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    tags: list[str] = []                # e.g. ["too bold", "loved it", "uncomfortable"]
    notes: str = ""
    confidence_before: int | None = Field(None, ge=1, le=10)
    confidence_after: int | None = Field(None, ge=1, le=10)


class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    outfit_id: str
    rating: int
    tags: list[str] = []
    notes: str = ""
    confidence_before: int | None = None
    confidence_after: int | None = None
    created_at: str = ""


class FeedbackListResponse(BaseModel):
    feedbacks: list[FeedbackResponse]
    total: int
