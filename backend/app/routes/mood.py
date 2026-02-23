"""
Vestora Backend — Mood-to-Style routes: generate outfit from free-text mood.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import wardrobe_items_collection, outfits_collection
from app.dependencies import get_current_user
from app.services.ai_service import chat_completion_json
from app.utils.helpers import utc_now, get_first_ai, build_preferences_context
from app.utils.image_utils import get_signed_url
import json

router = APIRouter()


class MoodRequest(BaseModel):
    mood_text: str          # e.g. "I feel powerful but mysterious today"
    occasion: str = ""


@router.post("/generate")
async def generate_mood_outfit(
    body: MoodRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate an outfit recommendation from a free-text mood description."""
    user_id = current_user["_id"]

    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=500)

    if len(w_items) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 analyzed items.")

    wardrobe_summary = []
    for w in w_items:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "id": str(w["_id"]),
            "category": ai.get("category", ""),
            "color": ai.get("primary_color", ""),
            "fabric": ai.get("fabric", ""),
            "pattern": ai.get("pattern", ""),
            "formality": ai.get("formality_score", 5),
        })

    pref_context, prefs_applied = build_preferences_context(current_user)

    messages = [
        {
            "role": "system",
            "content": (
                "You are an empathetic AI stylist who translates emotions into fashion. "
                "The user will describe how they feel. Interpret their mood, then select items "
                "from their wardrobe that express and amplify that feeling. "
                "Return JSON with:\n"
                "- mood_interpretation (string: your reading of their emotional state)\n"
                "- color_palette (array of 3-4 colors that match this mood)\n"
                "- selected_items (array of item IDs from the wardrobe)\n"
                "- outfit_name (creative name for this look)\n"
                "- reasoning (why these items express this mood)\n"
                "- affirmation (a short motivational message)\n"
                "Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"My mood: \"{body.mood_text}\"\n"
                f"{'Occasion: ' + body.occasion if body.occasion else ''}\n\n"
                f"My wardrobe ({len(wardrobe_summary)} items): {json.dumps(wardrobe_summary[:50])}\n"
                f"{pref_context + chr(10) if pref_context else ''}\n"
                "Create the perfect outfit for how I feel. Respect my saved preferences above."
            ),
        },
    ]

    try:
        ai_result = await chat_completion_json(messages, temperature=0.8)
    except json.JSONDecodeError:
        ai_result = {}

    # Build item details with image URLs
    valid_ids = {str(w["_id"]) for w in w_items}
    selected = ai_result.get("selected_items", [])
    selected = [s for s in selected if s in valid_ids]

    w_map = {str(w["_id"]): w for w in w_items}
    items_detail = []
    for sid in selected:
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
        "mood_text": body.mood_text,
        "mood_interpretation": ai_result.get("mood_interpretation", ""),
        "color_palette": ai_result.get("color_palette", []),
        "outfit_name": ai_result.get("outfit_name", ""),
        "items": items_detail,
        "reasoning": ai_result.get("reasoning", ""),
        "affirmation": ai_result.get("affirmation", ""),
        "preferences_applied": prefs_applied,
    }
