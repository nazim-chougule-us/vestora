"""
Vestora Backend — Outfit routes: generate, list, get, delete.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import outfits_collection, wardrobe_items_collection
from app.dependencies import get_current_user
from app.schemas.outfit_schema import (
    OutfitGenerateRequest,
    OutfitResponse,
    OutfitItemRef,
    OutfitListResponse,
)
from app.utils.image_utils import get_signed_url
from app.utils.helpers import utc_now, to_object_id, get_detected_items, get_first_ai, build_preferences_context
from app.services.ai_service import generate_outfit_reasoning

router = APIRouter()


def _build_response(doc: dict, wardrobe_docs: dict | None = None) -> OutfitResponse:
    """Build an OutfitResponse from a MongoDB document."""
    items = []
    for ref in doc.get("items", []):
        image_url = ""
        category = ref.get("category", "")
        if wardrobe_docs and ref["item_id"] in wardrobe_docs:
            wdoc = wardrobe_docs[ref["item_id"]]
            if wdoc.get("image_key"):
                try:
                    image_url = get_signed_url(wdoc["image_key"])
                except Exception:
                    pass
            if not category:
                first = get_first_ai(wdoc)
                category = first.get("category", "") if first else ""
        items.append(OutfitItemRef(
            item_id=ref["item_id"],
            category=category,
            image_url=image_url,
        ))

    return OutfitResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        occasion=doc.get("occasion", ""),
        mood=doc.get("mood"),
        dress_code=doc.get("dress_code"),
        items=items,
        reasoning=doc.get("reasoning", ""),
        confidence_boost=doc.get("confidence_boost", ""),
        styling_tips=doc.get("styling_tips", []),
        weather_note=doc.get("weather_note"),
        preferences_applied=doc.get("preferences_applied", []),
        created_at=doc.get("created_at", ""),
    )


@router.post("/generate", response_model=OutfitResponse, status_code=status.HTTP_201_CREATED)
async def generate_outfit(
    body: OutfitGenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate an AI outfit recommendation from wardrobe items."""
    user_id = current_user["_id"]

    # Fetch all user wardrobe items with AI attributes
    w_col = wardrobe_items_collection()
    cursor = w_col.find({"user_id": user_id, "ai_analyzed": True})
    w_items = await cursor.to_list(length=500)

    if len(w_items) < 2:
        raise HTTPException(
            status_code=400,
            detail="You need at least 2 analyzed wardrobe items to generate an outfit. Upload and analyze more items first.",
        )

    # Prepare wardrobe summary for AI — flatten detected_items from each doc
    wardrobe_summary = []
    for w in w_items:
        wid = str(w["_id"])
        for ai in get_detected_items(w):
            wardrobe_summary.append({
                "id": wid,
                "category": ai.get("category", "Unknown"),
                "color_primary": ai.get("primary_color", ""),
                "fabric": ai.get("fabric", ""),
                "pattern": ai.get("pattern", ""),
                "fit": ai.get("fit", ""),
                "season": ai.get("season", []),
                "occasion": ai.get("occasion", []),
                "formality_score": ai.get("formality_score", 5),
                "style_tags": ai.get("occasion", []),
            })

    # Build user preferences context from settings
    pref_context, prefs_applied = build_preferences_context(current_user)

    # Call AI
    try:
        ai_result = await generate_outfit_reasoning(
            wardrobe_items=wardrobe_summary,
            occasion=body.occasion,
            mood=body.mood,
            dress_code=body.dress_code,
            user_preferences=pref_context if pref_context else None,
            gender=current_user.get("gender"),
        )
    except Exception:
        raise HTTPException(status_code=503, detail="AI styling service is temporarily unavailable. Please try again.")

    # Extract selected item IDs from AI response
    selected_ids = ai_result.get("selected_items", [])
    # Validate IDs exist in user's wardrobe
    valid_ids = {str(w["_id"]) for w in w_items}
    selected_ids = [sid for sid in selected_ids if sid in valid_ids]

    # Build item refs — deduplicate wardrobe doc IDs
    w_items_map = {str(w["_id"]): w for w in w_items}
    seen_ids = set()
    outfit_items = []
    for sid in selected_ids:
        if sid in seen_ids:
            continue
        seen_ids.add(sid)
        wdoc = w_items_map.get(sid)
        first = get_first_ai(wdoc) if wdoc else {}
        category = first.get("category", "")
        outfit_items.append({
            "item_id": sid,
            "category": category,
        })

    # Store outfit in DB
    o_col = outfits_collection()
    doc = {
        "user_id": user_id,
        "occasion": body.occasion,
        "mood": body.mood,
        "dress_code": body.dress_code,
        "items": outfit_items,
        "reasoning": ai_result.get("reasoning", ""),
        "confidence_boost": ai_result.get("confidence_boost", ""),
        "styling_tips": ai_result.get("styling_tips", []),
        "weather_note": None,
        "preferences_applied": prefs_applied,
        "created_at": utc_now().isoformat(),
    }
    result = await o_col.insert_one(doc)
    doc["_id"] = result.inserted_id

    return _build_response(doc, w_items_map)


@router.get("", response_model=OutfitListResponse)
async def list_outfits(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List all generated outfits for the user."""
    user_id = current_user["_id"]
    o_col = outfits_collection()

    total = await o_col.count_documents({"user_id": user_id})
    cursor = o_col.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    # Fetch wardrobe items for image URLs
    all_item_ids = set()
    for doc in docs:
        for ref in doc.get("items", []):
            all_item_ids.add(ref["item_id"])

    w_col = wardrobe_items_collection()
    w_items_map = {}
    if all_item_ids:
        from bson import ObjectId
        w_cursor = w_col.find({"_id": {"$in": [ObjectId(i) for i in all_item_ids]}})
        async for wdoc in w_cursor:
            w_items_map[str(wdoc["_id"])] = wdoc

    outfits = [_build_response(doc, w_items_map) for doc in docs]
    return OutfitListResponse(outfits=outfits, total=total)


@router.get("/{outfit_id}", response_model=OutfitResponse)
async def get_outfit(
    outfit_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single outfit by ID."""
    doc = await outfits_collection().find_one({
        "_id": to_object_id(outfit_id),
        "user_id": current_user["_id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Outfit not found")

    # Fetch wardrobe items for image URLs
    all_item_ids = [ref["item_id"] for ref in doc.get("items", [])]
    w_items_map = {}
    if all_item_ids:
        from bson import ObjectId
        w_col = wardrobe_items_collection()
        w_cursor = w_col.find({"_id": {"$in": [ObjectId(i) for i in all_item_ids]}})
        async for wdoc in w_cursor:
            w_items_map[str(wdoc["_id"])] = wdoc

    return _build_response(doc, w_items_map)


@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_outfit(
    outfit_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an outfit."""
    result = await outfits_collection().delete_one({
        "_id": to_object_id(outfit_id),
        "user_id": current_user["_id"],
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Outfit not found")
