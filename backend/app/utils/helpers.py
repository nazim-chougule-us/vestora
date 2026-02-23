"""
Vestora Backend — Common utility helpers.
"""

from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException, status


def utc_now() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


def to_object_id(id_str: str) -> ObjectId:
    """Convert a string to a BSON ObjectId, raising HTTPException on failure."""
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid ID format: {id_str}",
        )


def get_detected_items(doc: dict) -> list[dict]:
    """
    Return the list of detected AI attribute dicts from a wardrobe document.
    Supports both new (detected_items) and old (ai_attributes) schema.
    """
    detected = doc.get("detected_items") or []
    if not detected and doc.get("ai_attributes"):
        detected = [doc["ai_attributes"]]
    return [d for d in detected if isinstance(d, dict)]


def get_first_ai(doc: dict) -> dict:
    """Return the first detected item's AI attributes dict, or empty dict."""
    items = get_detected_items(doc)
    return items[0] if items else {}


def build_preferences_context(user: dict) -> tuple[str, list[str]]:
    """
    Build an AI prompt context string from user preferences.
    Returns (context_string, list_of_applied_preferences).
    The list tells the frontend which preference categories were used.
    """
    parts = []
    applied = []

    bp = user.get("body_profile")
    if bp and isinstance(bp, dict):
        body_parts = []
        if bp.get("body_type"):
            body_parts.append(f"body type: {bp['body_type']}")
        if bp.get("height_cm"):
            body_parts.append(f"height: {int(bp['height_cm'])}cm")
        if bp.get("skin_tone"):
            body_parts.append(f"skin tone: {bp['skin_tone']}")
        if body_parts:
            parts.append(f"Body profile (from user settings): {', '.join(body_parts)}")
            applied.append("body_profile")

    sp = user.get("style_preferences")
    if sp and isinstance(sp, dict):
        style_parts = []
        if sp.get("preferred_styles"):
            style_parts.append(f"preferred styles: {', '.join(sp['preferred_styles'])}")
        if sp.get("preferred_fits"):
            style_parts.append(f"preferred fits: {', '.join(sp['preferred_fits'])}")
        if sp.get("favorite_colors"):
            style_parts.append(f"favorite colors: {', '.join(sp['favorite_colors'])}")
        if sp.get("avoided_colors"):
            style_parts.append(f"colors to AVOID: {', '.join(sp['avoided_colors'])}")
        if sp.get("comfort_level") and sp["comfort_level"] != "moderate":
            style_parts.append(f"comfort level: {sp['comfort_level']}")
        if style_parts:
            parts.append(f"Style preferences (from user settings): {'; '.join(style_parts)}")
            applied.append("style_preferences")

    cp = user.get("cultural_preferences")
    if cp and isinstance(cp, dict):
        cultural_parts = []
        if cp.get("modesty_level") and cp["modesty_level"] != "standard":
            cultural_parts.append(f"modesty level: {cp['modesty_level']}")
        if cp.get("cultural_tags"):
            cultural_parts.append(f"cultural tags: {', '.join(cp['cultural_tags'])}")
        if cultural_parts:
            parts.append(f"Cultural preferences (from user settings): {'; '.join(cultural_parts)}")
            applied.append("cultural_preferences")

    return "\n".join(parts), applied


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document ObjectId fields to strings for JSON serialization."""
    if doc is None:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    # Convert any nested ObjectId values
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc
