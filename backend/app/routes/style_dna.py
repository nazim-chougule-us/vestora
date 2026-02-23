"""
Vestora Backend — Style DNA routes: generate style profile from wardrobe analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.database import wardrobe_items_collection, feedback_collection, style_profiles_collection
from app.dependencies import get_current_user
from app.services.ai_service import chat_completion_json
from app.utils.helpers import utc_now, to_object_id, get_first_ai, build_preferences_context
import json

router = APIRouter()


@router.post("/generate")
async def generate_style_dna(
    current_user: dict = Depends(get_current_user),
):
    """Generate a Style DNA profile from wardrobe + feedback + preferences."""
    user_id = current_user["_id"]

    # Gather wardrobe data
    w_items = await wardrobe_items_collection().find(
        {"user_id": user_id, "ai_analyzed": True}
    ).to_list(length=500)

    if len(w_items) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 analyzed wardrobe items to generate Style DNA.")

    # Gather feedback history
    feedbacks = await feedback_collection().find({"user_id": user_id}).to_list(length=100)

    # Build wardrobe summary
    wardrobe_summary = []
    for w in w_items:
        ai = get_first_ai(w)
        wardrobe_summary.append({
            "category": ai.get("category", ""),
            "color": ai.get("primary_color", ""),
            "fabric": ai.get("fabric", ""),
            "pattern": ai.get("pattern", ""),
            "fit": ai.get("fit", ""),
            "occasion": ai.get("occasion", []),
            "formality": ai.get("formality_score", 5),
            "wear_count": w.get("wear_count", 0),
        })

    feedback_summary = []
    for f in feedbacks:
        feedback_summary.append({
            "rating": f.get("rating", 3),
            "tags": f.get("tags", []),
        })

    pref_context, prefs_applied = build_preferences_context(current_user)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a fashion psychologist and style analyst. Analyze this person's wardrobe data, "
                "feedback history, and preferences to create their Style DNA profile. "
                "Return a JSON object with:\n"
                "- style_archetype (string, e.g. 'Minimalist Modern', 'Urban Explorer', 'Classic Gentleman')\n"
                "- style_tags (array of 5-8 descriptive tags)\n"
                "- color_palette (array of their top 5 preferred colors)\n"
                "- style_dimensions (object with scores 1-10 for: casual_formal, minimal_maximal, classic_trendy, subtle_bold, comfort_style)\n"
                "- summary (2-3 sentence personality-driven style summary)\n"
                "- growth_areas (array of 2-3 style expansion suggestions)\n"
                "Return ONLY valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Wardrobe ({len(wardrobe_summary)} items): {json.dumps(wardrobe_summary[:50])}\n\n"
                f"Feedback ({len(feedback_summary)} entries): {json.dumps(feedback_summary[:20])}\n\n"
                f"{pref_context + chr(10) if pref_context else ''}"
                "Generate my Style DNA profile."
            ),
        },
    ]

    try:
        profile = await chat_completion_json(messages, temperature=0.7)
    except json.JSONDecodeError:
        profile = {"parse_error": True}

    # Store in DB
    col = style_profiles_collection()
    doc = {
        "user_id": user_id,
        "profile": profile,
        "created_at": utc_now().isoformat(),
    }
    await col.insert_one(doc)

    return {"profile": profile, "created_at": doc["created_at"]}


@router.get("")
async def get_style_dna(
    current_user: dict = Depends(get_current_user),
):
    """Get the latest Style DNA profile."""
    user_id = current_user["_id"]
    col = style_profiles_collection()

    doc = await col.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )

    if not doc:
        return {"profile": None}

    return {"profile": doc.get("profile"), "created_at": doc.get("created_at", "")}
