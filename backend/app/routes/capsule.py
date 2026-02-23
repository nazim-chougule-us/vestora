"""
Vestora Backend — Capsule Wardrobe routes: generate packing lists from wardrobe.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import wardrobe_items_collection
from app.dependencies import get_current_user
from app.services.ai_service import chat_completion_json
from app.utils.image_utils import get_signed_url
from app.utils.helpers import get_first_ai, build_preferences_context
import json

router = APIRouter()


class CapsuleRequest(BaseModel):
    trip_length: int = 7           # days
    climate: str = "Temperate"     # Hot, Cold, Temperate, Tropical
    events: list[str] = []         # e.g. ["Business meetings", "Dinner", "Sightseeing"]
    notes: str = ""


@router.post("/generate")
async def generate_capsule(
    body: CapsuleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate a capsule wardrobe / packing list from existing wardrobe items."""
    user_id = current_user["_id"]

    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=500)

    if len(w_items) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 analyzed items.")

    wardrobe_summary = []
    for w in w_items:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "id": str(w["_id"]),
            "category": ai.get("category", ""),
            "color": ai.get("primary_color", ""),
            "fabric": ai.get("fabric", ""),
            "season": ai.get("season", []),
            "occasion": ai.get("occasion", []),
        })

    events_text = ", ".join(body.events) if body.events else "General travel"

    pref_context, prefs_applied = build_preferences_context(current_user)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a travel packing expert. Create a capsule wardrobe from the user's existing items. "
                "Maximize outfit combinations while minimizing items packed. "
                "Return JSON with:\n"
                "- capsule_name (creative name)\n"
                "- selected_items (array of item IDs)\n"
                "- outfit_combos (array of objects, each with: name, item_ids, occasion)\n"
                "- packing_tips (array of 3-5 tips)\n"
                "- total_outfits (number of possible combinations)\n"
                "Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Trip: {body.trip_length} days, Climate: {body.climate}\n"
                f"Events: {events_text}\n"
                f"{'Notes: ' + body.notes if body.notes else ''}\n"
                f"{pref_context + chr(10) if pref_context else ''}\n"
                f"Wardrobe ({len(wardrobe_summary)} items): {json.dumps(wardrobe_summary[:50])}\n\n"
                "Create my capsule wardrobe. Respect my saved preferences above."
            ),
        },
    ]

    try:
        ai_result = await chat_completion_json(messages, temperature=0.7)
    except json.JSONDecodeError:
        ai_result = {}

    # Add image URLs to selected items
    valid_ids = {str(w["_id"]) for w in w_items}
    w_map = {str(w["_id"]): w for w in w_items}
    selected = ai_result.get("selected_items", [])
    items_detail = []
    for sid in [s for s in selected if s in valid_ids]:
        wdoc = w_map.get(sid)
        if wdoc:
            ai = get_first_ai(wdoc)
            img_url = ""
            if wdoc.get("image_key"):
                try:
                    img_url = get_signed_url(wdoc["image_key"])
                except Exception:
                    pass
            items_detail.append({
                "item_id": sid,
                "category": ai.get("category", ""),
                "color": ai.get("primary_color", ""),
                "image_url": img_url,
            })

    return {
        "capsule_name": ai_result.get("capsule_name", "Travel Capsule"),
        "items": items_detail,
        "outfit_combos": ai_result.get("outfit_combos", []),
        "packing_tips": ai_result.get("packing_tips", []),
        "total_outfits": ai_result.get("total_outfits", 0),
        "trip_length": body.trip_length,
        "climate": body.climate,
        "preferences_applied": prefs_applied,
    }
