"""
Vestora Backend — Feedback routes: submit feedback, list feedback for an outfit.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import feedback_collection, outfits_collection
from app.dependencies import get_current_user
from app.schemas.feedback_schema import (
    FeedbackCreateRequest,
    FeedbackResponse,
    FeedbackListResponse,
)
from app.utils.helpers import utc_now, to_object_id

router = APIRouter()


def _build_response(doc: dict) -> FeedbackResponse:
    return FeedbackResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        outfit_id=str(doc["outfit_id"]),
        rating=doc.get("rating", 3),
        tags=doc.get("tags", []),
        notes=doc.get("notes", ""),
        confidence_before=doc.get("confidence_before"),
        confidence_after=doc.get("confidence_after"),
        created_at=doc.get("created_at", ""),
    )


@router.post("/{outfit_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    outfit_id: str,
    body: FeedbackCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Submit feedback for an outfit."""
    user_id = current_user["_id"]

    # Verify outfit exists and belongs to user
    outfit = await outfits_collection().find_one({
        "_id": to_object_id(outfit_id),
        "user_id": user_id,
    })
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    doc = {
        "user_id": user_id,
        "outfit_id": outfit_id,
        "rating": body.rating,
        "tags": body.tags,
        "notes": body.notes,
        "confidence_before": body.confidence_before,
        "confidence_after": body.confidence_after,
        "created_at": utc_now().isoformat(),
    }

    result = await feedback_collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return _build_response(doc)


@router.get("/{outfit_id}/feedback", response_model=FeedbackListResponse)
async def list_feedback(
    outfit_id: str,
    current_user: dict = Depends(get_current_user),
):
    """List all feedback for a specific outfit."""
    user_id = current_user["_id"]
    col = feedback_collection()

    query = {"user_id": user_id, "outfit_id": outfit_id}
    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    return FeedbackListResponse(
        feedbacks=[_build_response(d) for d in docs],
        total=total,
    )


@router.get("/history", response_model=FeedbackListResponse)
async def feedback_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List all feedback across all outfits for the user."""
    user_id = current_user["_id"]
    col = feedback_collection()

    query = {"user_id": user_id}
    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    return FeedbackListResponse(
        feedbacks=[_build_response(d) for d in docs],
        total=total,
    )
