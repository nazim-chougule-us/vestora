"""
Vestora Backend — Shopping Assistant routes: wardrobe gap analysis + recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import wardrobe_items_collection
from app.dependencies import get_current_user
from app.services.ai_service import chat_completion_json
from app.utils.helpers import get_first_ai, build_preferences_context
import json

router = APIRouter()


class ShoppingRequest(BaseModel):
    budget: float | None = None
    occasion: str = ""
    notes: str = ""


@router.post("/recommend")
async def shopping_recommend(
    body: ShoppingRequest,
    current_user: dict = Depends(get_current_user),
):
    """Analyze wardrobe gaps and recommend shopping items with web search."""
    user_id = current_user["_id"]

    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=500)

    wardrobe_summary = []
    for w in w_items:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "category": ai.get("category", ""),
            "color": ai.get("primary_color", ""),
            "fabric": ai.get("fabric", ""),
            "season": ai.get("season", []),
            "occasion": ai.get("occasion", []),
        })

    budget_text = f"Budget: ${body.budget}" if body.budget else "No specific budget"

    pref_context, prefs_applied = build_preferences_context(current_user)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a personal shopping assistant AI. Analyze the user's wardrobe to find gaps "
                "and recommend specific items to buy. Consider versatility, color coordination, "
                "and season coverage. Return JSON with:\n"
                "- gap_analysis (array of strings describing what's missing)\n"
                "- recommendations (array of objects with: item_name, category, color, reason, "
                "  estimated_price, priority (high/medium/low), match_count (how many existing items it pairs with))\n"
                "- sustainable_tips (array of 2-3 eco-friendly shopping tips)\n"
                "Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"My wardrobe ({len(wardrobe_summary)} items): {json.dumps(wardrobe_summary[:50])}\n\n"
                f"{budget_text}\n"
                f"{'Occasion focus: ' + body.occasion if body.occasion else ''}\n"
                f"{'Notes: ' + body.notes if body.notes else ''}\n"
                f"{pref_context + chr(10) if pref_context else ''}\n"
                "What should I buy next? Respect my saved preferences above."
            ),
        },
    ]

    try:
        ai_result = await chat_completion_json(messages, temperature=0.7, web_search=True)
    except json.JSONDecodeError:
        ai_result = {}

    return {
        "gap_analysis": ai_result.get("gap_analysis", []),
        "recommendations": ai_result.get("recommendations", []),
        "sustainable_tips": ai_result.get("sustainable_tips", []),
        "total_items_analyzed": len(wardrobe_summary),
        "preferences_applied": prefs_applied,
    }
