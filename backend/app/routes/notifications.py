"""
Vestora Backend — Notifications routes: list, mark read, generate daily outfit.
"""

from fastapi import APIRouter, Depends, Query, status
from app.database import notifications_collection, wardrobe_items_collection
from app.dependencies import get_current_user
from app.utils.helpers import utc_now, to_object_id, get_first_ai
from app.services.ai_service import chat_completion
import json

router = APIRouter()


@router.get("")
async def list_notifications(
    unread_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List notifications for the user."""
    user_id = current_user["_id"]
    col = notifications_collection()

    query: dict = {"user_id": user_id}
    if unread_only:
        query["read"] = False

    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    items = []
    for d in docs:
        items.append({
            "id": str(d["_id"]),
            "type": d.get("type", "info"),
            "title": d.get("title", ""),
            "body": d.get("body", ""),
            "read": d.get("read", False),
            "created_at": d.get("created_at", ""),
        })

    unread_count = await col.count_documents({"user_id": user_id, "read": False})

    return {"notifications": items, "total": total, "unread_count": unread_count}


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a notification as read."""
    col = notifications_collection()
    result = await col.update_one(
        {"_id": to_object_id(notification_id), "user_id": current_user["_id"]},
        {"$set": {"read": True}},
    )
    return {"ok": result.modified_count > 0}


@router.post("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
):
    """Mark all notifications as read."""
    col = notifications_collection()
    result = await col.update_many(
        {"user_id": current_user["_id"], "read": False},
        {"$set": {"read": True}},
    )
    return {"marked": result.modified_count}


@router.post("/generate-daily")
async def generate_daily_notification(
    current_user: dict = Depends(get_current_user),
):
    """Generate today's outfit suggestion notification."""
    user_id = current_user["_id"]

    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=50)

    if len(w_items) < 2:
        return {"message": "Not enough items for a daily suggestion."}

    wardrobe_summary = []
    for w in w_items[:20]:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "category": ai.get("category", ""),
            "color": ai.get("primary_color", ""),
            "season": ai.get("season", []),
        })

    messages = [
        {
            "role": "system",
            "content": (
                "Generate a short, friendly daily outfit suggestion (2-3 sentences) based on the user's wardrobe. "
                "Return JSON with: title (catchy 5-word max), body (the suggestion). Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": f"Wardrobe: {json.dumps(wardrobe_summary)}",
        },
    ]

    try:
        result = await chat_completion(messages, temperature=0.8, max_tokens=200)
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        ai_result = json.loads(cleaned)
    except Exception:
        ai_result = {"title": "Today's Outfit", "body": "Mix your favorite pieces for a fresh look!"}

    col = notifications_collection()
    doc = {
        "user_id": user_id,
        "type": "daily_outfit",
        "title": ai_result.get("title", "Today's Outfit"),
        "body": ai_result.get("body", ""),
        "read": False,
        "created_at": utc_now().isoformat(),
    }
    await col.insert_one(doc)

    return {"title": doc["title"], "body": doc["body"]}
