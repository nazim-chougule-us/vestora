"""
Vestora Backend — Fashion Forecast routes: trend analysis and style predictions.
"""

from fastapi import APIRouter, Depends
from app.database import wardrobe_items_collection, feedback_collection
from app.dependencies import get_current_user
from app.services.ai_service import chat_completion_json
from app.utils.helpers import get_first_ai, build_preferences_context
import json

router = APIRouter()


@router.get("")
async def get_forecast(
    current_user: dict = Depends(get_current_user),
):
    """Analyze user's evolving taste and predict style trends."""
    user_id = current_user["_id"]

    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=500)

    feedbacks = await feedback_collection().find({"user_id": user_id}).to_list(length=100)

    if len(w_items) < 3:
        return {
            "trends": [],
            "style_shift": "",
            "predictions": [],
            "message": "Add more wardrobe items to get fashion forecasts.",
        }

    wardrobe_summary = []
    for w in w_items[:20]:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "cat": ai.get("category", ""),
            "col": ai.get("primary_color", ""),
            "pat": ai.get("pattern", ""),
            "fit": ai.get("fit", ""),
            "ssn": ai.get("season", []),
            "wears": w.get("wear_count", 0),
        })

    feedback_summary = [{"r": f.get("rating", 3), "t": f.get("tags", [])} for f in feedbacks[:10]]

    pref_context, prefs_applied = build_preferences_context(current_user)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a fashion trend analyst. Analyze the user's wardrobe evolution and feedback "
                "to detect style shifts and predict their next style direction. "
                "Return JSON with:\n"
                "- style_shift (string: description of how their style is evolving)\n"
                "- current_trends (array of objects with: trend_name, description, relevance_score 1-10)\n"
                "- predictions (array of objects with: prediction, confidence, timeframe)\n"
                "- early_adoption (array of 2-3 trends they should try)\n"
                "Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Wardrobe ({len(wardrobe_summary)} items): {json.dumps(wardrobe_summary)}\n"
                f"Feedback: {json.dumps(feedback_summary)}\n"
                f"{pref_context + chr(10) if pref_context else ''}"
                "Analyze style evolution and predict trends."
            ),
        },
    ]

    try:
        ai_result = await chat_completion_json(messages, temperature=0.7, max_tokens=1024, web_search=True)
    except Exception:
        return {
            "style_shift": "",
            "current_trends": [],
            "predictions": [],
            "early_adoption": [],
            "message": "Forecast timed out — the AI is taking longer than usual. Please try again.",
        }

    return {
        "style_shift": ai_result.get("style_shift", ""),
        "current_trends": ai_result.get("current_trends", []),
        "predictions": ai_result.get("predictions", []),
        "early_adoption": ai_result.get("early_adoption", []),
        "preferences_applied": prefs_applied,
    }
