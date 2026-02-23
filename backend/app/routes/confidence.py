"""
Vestora Backend — Confidence Engine routes: log confidence, get trends, power outfits.
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from app.database import confidence_logs_collection, outfits_collection
from app.dependencies import get_current_user
from app.utils.helpers import utc_now
from collections import Counter

router = APIRouter()


class ConfidenceLogRequest(BaseModel):
    outfit_id: str | None = None
    event_type: str = Field("", max_length=100)
    feeling_rating: int = Field(..., ge=1, le=10)
    compliments_received: int = Field(0, ge=0)
    notes: str = Field("", max_length=1000)


@router.post("/log")
async def log_confidence(
    body: ConfidenceLogRequest,
    current_user: dict = Depends(get_current_user),
):
    """Log a confidence entry after wearing an outfit."""
    doc = {
        "user_id": current_user["_id"],
        "outfit_id": body.outfit_id,
        "event_type": body.event_type,
        "feeling_rating": body.feeling_rating,
        "compliments_received": body.compliments_received,
        "notes": body.notes,
        "created_at": utc_now().isoformat(),
    }
    result = await confidence_logs_collection().insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Logged!"}


@router.get("/history")
async def confidence_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get confidence log history."""
    col = confidence_logs_collection()
    query = {"user_id": current_user["_id"]}
    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    logs = []
    for d in docs:
        logs.append({
            "id": str(d["_id"]),
            "outfit_id": d.get("outfit_id"),
            "event_type": d.get("event_type", ""),
            "feeling_rating": d.get("feeling_rating", 5),
            "compliments_received": d.get("compliments_received", 0),
            "notes": d.get("notes", ""),
            "created_at": d.get("created_at", ""),
        })

    return {"logs": logs, "total": total}


@router.get("/stats")
async def confidence_stats(
    current_user: dict = Depends(get_current_user),
):
    """Get confidence statistics and power outfits."""
    col = confidence_logs_collection()
    docs = await col.find({"user_id": current_user["_id"]}).to_list(length=500)

    if not docs:
        return {
            "avg_confidence": None,
            "total_compliments": 0,
            "total_entries": 0,
            "power_outfit_ids": [],
            "trend": [],
        }

    total_entries = len(docs)
    avg_confidence = round(sum(d.get("feeling_rating", 5) for d in docs) / total_entries, 1)
    total_compliments = sum(d.get("compliments_received", 0) for d in docs)

    # Power outfits: outfits with highest average confidence
    outfit_scores: dict[str, list[int]] = {}
    for d in docs:
        oid = d.get("outfit_id")
        if oid:
            outfit_scores.setdefault(oid, []).append(d.get("feeling_rating", 5))

    power_outfits = sorted(
        outfit_scores.items(),
        key=lambda x: sum(x[1]) / len(x[1]),
        reverse=True,
    )[:5]
    power_outfit_ids = [oid for oid, _ in power_outfits]

    # Trend: last 20 entries chronologically
    sorted_docs = sorted(docs, key=lambda d: d.get("created_at", ""))[-20:]
    trend = [
        {"date": d.get("created_at", "")[:10], "rating": d.get("feeling_rating", 5)}
        for d in sorted_docs
    ]

    return {
        "avg_confidence": avg_confidence,
        "total_compliments": total_compliments,
        "total_entries": total_entries,
        "power_outfit_ids": power_outfit_ids,
        "trend": trend,
    }
