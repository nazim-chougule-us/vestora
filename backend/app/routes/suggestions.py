"""
Vestora Backend — Outfit Suggestion routes: generate, list, delete.
Uses LLM with web search to find trending outfits and give personalized suggestions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.suggestion_schema import (
    SuggestionRequest,
    SuggestionResponse,
    SuggestionOutfit,
    SuggestionListResponse,
)
from app.services.ai_service import chat_completion_json
from app.utils.helpers import utc_now, to_object_id
from app.utils.image_utils import get_signed_url, upload_to_s3
from app.config import settings
import asyncio
import httpx
import base64
import uuid
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()


def _suggestions_collection():
    return get_db()["outfit_suggestions"]


def _build_response(doc: dict) -> SuggestionResponse:
    outfits = []
    for o in doc.get("outfits", []):
        image_url = ""
        if o.get("image_key"):
            try:
                image_url = get_signed_url(o["image_key"])
            except Exception:
                pass
        outfits.append(SuggestionOutfit(
            title=o.get("title", ""),
            items=o.get("items", []),
            why_it_works=o.get("why_it_works", ""),
            styling_tips=o.get("styling_tips", []),
            estimated_budget=o.get("estimated_budget", ""),
            trend_source=o.get("trend_source", ""),
            confidence_note=o.get("confidence_note", ""),
            image_key=o.get("image_key", ""),
            image_url=image_url,
        ))
    return SuggestionResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        query=doc.get("query", {}),
        outfits=outfits,
        trending_context=doc.get("trending_context", ""),
        created_at=doc.get("created_at", ""),
    )


@router.post("/generate", response_model=SuggestionResponse, status_code=status.HTTP_201_CREATED)
async def generate_suggestions(
    body: SuggestionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate trending outfit suggestions based on user requirements."""
    user_id = current_user["_id"]
    gender = body.gender or current_user.get("gender", "unspecified")

    # Build the LLM prompt with web search for trending data
    context_parts = [f"Occasion: {body.occasion}"]
    context_parts.append(f"Gender: {gender}")
    if body.style:
        context_parts.append(f"Preferred style: {body.style}")
    if body.budget:
        context_parts.append(f"Budget: {body.budget}")
    if body.season:
        context_parts.append(f"Season: {body.season}")
    if body.notes:
        context_parts.append(f"Additional requirements: {body.notes}")

    context_str = "\n".join(context_parts)

    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert fashion stylist AI with deep knowledge of current trends. "
                "You have access to web search to find the latest trending outfits and fashion. "
                "Based on the user's requirements, suggest 4 complete outfit ideas that are "
                "currently trending or highly recommended.\n\n"
                "For EACH outfit, provide:\n"
                "- title: A catchy name for the outfit (e.g. 'Modern Minimalist Office')\n"
                "- items: Array of 4-6 specific clothing item descriptions with brand suggestions "
                "  (e.g. 'Navy slim-fit chinos — Uniqlo or Zara')\n"
                "- why_it_works: 2-3 sentences on why this outfit is great for the occasion\n"
                "- styling_tips: Array of 2-3 actionable styling tips\n"
                "- estimated_budget: Price range estimate (e.g. '$80-150')\n"
                "- trend_source: Where this trend is coming from (e.g. 'Pinterest 2025 trending', "
                "  'Milan Fashion Week SS25', 'TikTok #quietluxury')\n"
                "- confidence_note: A short motivational note\n\n"
                "Also include a top-level 'trending_context' field: a 2-3 sentence summary of "
                "what's currently trending in fashion relevant to their request.\n\n"
                "Return JSON with:\n"
                "{\n"
                '  "trending_context": "...",\n'
                '  "outfits": [{...}, {...}, {...}, {...}]\n'
                "}\n"
                "Return ONLY valid JSON, no extra text."
            ),
        },
        {
            "role": "user",
            "content": (
                f"I need outfit suggestions for the following:\n\n{context_str}\n\n"
                "Search for the latest trending outfits and fashion recommendations "
                "that match my requirements. Give me 4 complete outfit ideas with specific "
                "item suggestions including affordable brand options."
            ),
        },
    ]

    try:
        result = await chat_completion_json(
            messages, temperature=0.8, max_tokens=3000, web_search=False, retries=3
        )
    except Exception as e:
        logger.error("Failed to generate outfit suggestions: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to generate suggestions. Please try again.")

    if isinstance(result, list):
        result = {"outfits": result, "trending_context": ""}

    # Generate images for each outfit in parallel
    outfits_data = result.get("outfits", [])
    async def _gen_outfit_image(outfit: dict, idx: int) -> str:
        """Generate an image for a single outfit, return S3 key or empty."""
        items_text = ", ".join(outfit.get("items", []))
        gender_desc = "male" if gender == "male" else "female" if gender == "female" else "fashion"
        prompt = (
            f"A {gender_desc} fashion model wearing this complete outfit: {items_text}. "
            f"Full body portrait, head to toe, high quality fashion photography, "
            f"clean white studio background, soft professional lighting."
        )
        url = f"{settings.usinc_base_url}/images/generations"
        headers = {"x-api-key": settings.usinc_api_key, "Content-Type": "application/json"}
        payload = {"model": settings.usinc_image_model, "prompt": prompt, "n": 1, "size": "1024x1024"}
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
            images = data.get("images", [])
            if not images:
                return ""
            b64_raw = images[0].get("url", "")
            if not b64_raw:
                return ""
            b64_clean = b64_raw
            if "," in b64_clean:
                b64_clean = b64_clean.split(",", 1)[1]
            b64_clean = b64_clean.strip().replace("\n", "").replace("\r", "").replace(" ", "")
            remainder = len(b64_clean) % 4
            if remainder:
                b64_clean = b64_clean[:len(b64_clean) - remainder]
            img_bytes = base64.b64decode(b64_clean)
            s3_key = f"suggestions/{user_id}/{uuid.uuid4().hex}_{idx}.png"
            await upload_to_s3(img_bytes, s3_key, "image/png")
            logger.info("Suggestion outfit %d image uploaded: %s", idx, s3_key)
            return s3_key
        except Exception as e:
            logger.warning("Failed to generate image for outfit %d: %s", idx, str(e))
            return ""

    # Generate images in parallel
    image_keys = await asyncio.gather(
        *[_gen_outfit_image(o, i) for i, o in enumerate(outfits_data)]
    )
    for i, key in enumerate(image_keys):
        if key and i < len(outfits_data):
            outfits_data[i]["image_key"] = key

    # Save to DB
    query_doc = {
        "occasion": body.occasion,
        "style": body.style,
        "budget": body.budget,
        "season": body.season,
        "gender": gender,
        "notes": body.notes,
    }

    doc = {
        "user_id": user_id,
        "query": query_doc,
        "outfits": result.get("outfits", []),
        "trending_context": result.get("trending_context", ""),
        "created_at": utc_now().isoformat(),
    }

    col = _suggestions_collection()
    insert_result = await col.insert_one(doc)
    doc["_id"] = insert_result.inserted_id

    return _build_response(doc)


@router.get("", response_model=SuggestionListResponse)
async def list_suggestions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List saved outfit suggestions for the user."""
    user_id = current_user["_id"]
    col = _suggestions_collection()

    total = await col.count_documents({"user_id": user_id})
    cursor = col.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    return SuggestionListResponse(
        suggestions=[_build_response(d) for d in docs],
        total=total,
    )


@router.delete("/{suggestion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_suggestion(
    suggestion_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a saved outfit suggestion."""
    col = _suggestions_collection()
    result = await col.delete_one({
        "_id": to_object_id(suggestion_id),
        "user_id": current_user["_id"],
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Suggestion not found")
