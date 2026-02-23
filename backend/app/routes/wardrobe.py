"""
Vestora Backend — Wardrobe routes: upload, list, detail, update, delete, wear, analyze.
One document per uploaded image. detected_items array holds every garment the AI found.
"""

import logging
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from app.database import wardrobe_items_collection as wardrobe_collection
from app.dependencies import get_current_user
from app.schemas.wardrobe_schema import (
    WardrobeItemResponse,
    WardrobeItemUpdate,
    WardrobeListResponse,
    AIAttributes,
)
from app.utils.image_utils import upload_to_s3, get_signed_url, delete_from_s3, normalize_image_for_llm
from app.utils.helpers import utc_now, to_object_id

logger = logging.getLogger(__name__)


def _escape_regex(val: str) -> str:
    """Escape special regex characters in user input to prevent ReDoS."""
    return re.escape(val)

router = APIRouter()


def _build_response(doc: dict) -> WardrobeItemResponse:
    """Build a WardrobeItemResponse from a MongoDB document, including signed URL."""
    image_url = ""
    if doc.get("image_key"):
        try:
            image_url = get_signed_url(doc["image_key"])
        except Exception:
            image_url = ""

    cost_per_wear = None
    if doc.get("purchase_price") and doc.get("wear_count", 0) > 0:
        cost_per_wear = round(doc["purchase_price"] / doc["wear_count"], 2)

    # Normalise: support both old (ai_attributes) and new (detected_items) docs
    detected = doc.get("detected_items") or []
    if not detected and doc.get("ai_attributes"):
        detected = [doc["ai_attributes"]]

    return WardrobeItemResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        image_key=doc.get("image_key", ""),
        image_url=image_url,
        detected_items=[AIAttributes(**d) if isinstance(d, dict) else d for d in detected],
        notes=doc.get("notes", ""),
        purchase_price=doc.get("purchase_price"),
        tags=doc.get("tags", []),
        wear_count=doc.get("wear_count", 0),
        cost_per_wear=cost_per_wear,
        last_worn_at=doc.get("last_worn_at"),
        wear_dates=doc.get("wear_dates", []),
        ai_analyzed=doc.get("ai_analyzed", False),
        created_at=doc.get("created_at", ""),
    )


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=WardrobeItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_item(
    file: UploadFile = File(...),
    notes: str = Form(""),
    purchase_price: float | None = Form(None),
    tags: str = Form(""),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a clothing image to S3, auto-analyze it with AI, and create
    ONE wardrobe entry with all detected items inside detected_items[].
    """
    user_id = current_user["_id"]

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    # Convert unsupported formats (AVIF, HEIC, WebP, etc.) to JPEG for LLM compat
    contents, content_type, ext = normalize_image_for_llm(
        contents, file.content_type or "image/jpeg"
    )
    s3_key = f"wardrobe/{user_id}/{uuid.uuid4().hex}.{ext}"
    await upload_to_s3(contents, s3_key, content_type)

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    # Auto-analyze: detect ALL clothing items in the photo
    image_url = get_signed_url(s3_key)
    from app.services.ai_service import analyze_clothing_multi

    detected_items: list[dict] = []
    ai_analyzed = False
    try:
        raw = await analyze_clothing_multi(image_url)
        detected_items = [d for d in raw if not d.get("parse_error")]
        if detected_items:
            # Validate each item through the schema
            detected_items = [AIAttributes(**d).model_dump() for d in detected_items]
            ai_analyzed = True
    except Exception as e:
        logger.warning("Auto-analyze failed for %s: %s", s3_key, str(e))

    col = wardrobe_collection()
    doc = {
        "user_id": user_id,
        "image_key": s3_key,
        "detected_items": detected_items,
        "notes": notes,
        "purchase_price": purchase_price,
        "tags": tag_list,
        "wear_count": 0,
        "ai_analyzed": ai_analyzed,
        "created_at": utc_now().isoformat(),
    }
    result = await col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _build_response(doc)


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------
@router.get("", response_model=WardrobeListResponse)
async def list_items(
    category: str | None = Query(None),
    color: str | None = Query(None),
    season: str | None = Query(None),
    fabric: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List wardrobe items with optional filters."""
    user_id = current_user["_id"]
    query: dict = {"user_id": user_id}

    if category:
        query["detected_items.category"] = {"$regex": _escape_regex(category), "$options": "i"}
    if color:
        query["$or"] = [
            {"detected_items.primary_color": {"$regex": _escape_regex(color), "$options": "i"}},
            {"detected_items.secondary_color": {"$regex": _escape_regex(color), "$options": "i"}},
        ]
    if season:
        query["detected_items.season"] = {"$regex": _escape_regex(season), "$options": "i"}
    if fabric:
        query["detected_items.fabric"] = {"$regex": _escape_regex(fabric), "$options": "i"}
    if search:
        escaped = _escape_regex(search)
        or_clauses = query.get("$or", [])
        or_clauses += [
            {"notes": {"$regex": escaped, "$options": "i"}},
            {"tags": {"$regex": escaped, "$options": "i"}},
            {"detected_items.category": {"$regex": escaped, "$options": "i"}},
            {"detected_items.brand": {"$regex": escaped, "$options": "i"}},
        ]
        query["$or"] = or_clauses

    col = wardrobe_collection()
    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    items = [_build_response(doc) for doc in docs]
    return WardrobeListResponse(items=items, total=total)


# ---------------------------------------------------------------------------
# Get / Update / Delete / Wear / Analyze
# ---------------------------------------------------------------------------
@router.get("/{item_id}", response_model=WardrobeItemResponse)
async def get_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single wardrobe item by ID."""
    doc = await wardrobe_collection().find_one({
        "_id": to_object_id(item_id), "user_id": current_user["_id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    return _build_response(doc)


@router.patch("/{item_id}", response_model=WardrobeItemResponse)
async def update_item(item_id: str, body: WardrobeItemUpdate, current_user: dict = Depends(get_current_user)):
    """Update a wardrobe item (notes, tags, price)."""
    col = wardrobe_collection()
    oid = to_object_id(item_id)
    doc = await col.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = {}
    if body.notes is not None:
        update_data["notes"] = body.notes
    if body.purchase_price is not None:
        update_data["purchase_price"] = body.purchase_price
    if body.tags is not None:
        update_data["tags"] = body.tags
    if update_data:
        await col.update_one({"_id": oid}, {"$set": update_data})

    updated = await col.find_one({"_id": oid})
    return _build_response(updated)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a wardrobe item and its S3 image."""
    col = wardrobe_collection()
    oid = to_object_id(item_id)
    doc = await col.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    if doc.get("image_key"):
        try:
            await delete_from_s3(doc["image_key"])
        except Exception:
            pass
    await col.delete_one({"_id": oid})


@router.post("/{item_id}/wear", response_model=WardrobeItemResponse)
async def mark_worn(item_id: str, current_user: dict = Depends(get_current_user)):
    """Increment wear count, record timestamp in wear_dates[], and set last_worn_at."""
    col = wardrobe_collection()
    oid = to_object_id(item_id)
    doc = await col.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    now = utc_now().isoformat()
    await col.update_one(
        {"_id": oid},
        {
            "$inc": {"wear_count": 1},
            "$set": {"last_worn_at": now},
            "$push": {"wear_dates": now},
        },
    )
    updated = await col.find_one({"_id": oid})
    return _build_response(updated)


@router.post("/{item_id}/analyze", response_model=WardrobeItemResponse)
async def analyze_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Re-run AI analysis for a wardrobe item image."""
    col = wardrobe_collection()
    oid = to_object_id(item_id)
    doc = await col.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    image_url = get_signed_url(doc["image_key"])
    from app.services.ai_service import analyze_clothing_multi
    try:
        raw = await analyze_clothing_multi(image_url)
        items = [d for d in raw if not d.get("parse_error")]
        if not items:
            raise HTTPException(status_code=503, detail="AI analysis returned no valid data.")
        detected = [AIAttributes(**d).model_dump() for d in items]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="AI analysis service is temporarily unavailable.")

    await col.update_one(
        {"_id": oid},
        {"$set": {"detected_items": detected, "ai_analyzed": True}},
    )
    updated = await col.find_one({"_id": oid})
    return _build_response(updated)
