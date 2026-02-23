"""
Vestora Backend — User profile routes: get profile, update profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.database import users_collection
from app.dependencies import get_current_user
from app.schemas.user_schema import ProfileUpdateRequest, ProfileResponse
from app.utils.helpers import to_object_id

router = APIRouter()


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return the full user profile."""
    return ProfileResponse(
        id=current_user.get("_id", current_user.get("id", "")),
        email=current_user["email"],
        name=current_user["name"],
        gender=current_user.get("gender"),
        body_profile=current_user.get("body_profile"),
        style_preferences=current_user.get("style_preferences"),
        cultural_preferences=current_user.get("cultural_preferences"),
        theme=current_user.get("theme", "midnight"),
        created_at=current_user.get("created_at"),
    )


@router.patch("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile fields (partial update)."""
    col = users_collection()
    user_id = current_user.get("_id", current_user.get("id", ""))

    # Build update dict from non-None fields
    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.gender is not None:
        update_data["gender"] = body.gender
    if body.body_profile is not None:
        update_data["body_profile"] = body.body_profile.model_dump()
    if body.style_preferences is not None:
        update_data["style_preferences"] = body.style_preferences.model_dump()
    if body.cultural_preferences is not None:
        update_data["cultural_preferences"] = body.cultural_preferences.model_dump()
    if body.theme is not None:
        update_data["theme"] = body.theme

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    await col.update_one(
        {"_id": to_object_id(user_id)},
        {"$set": update_data},
    )

    # Fetch updated document
    updated = await col.find_one({"_id": to_object_id(user_id)})
    return ProfileResponse(
        id=str(updated["_id"]),
        email=updated["email"],
        name=updated["name"],
        gender=updated.get("gender"),
        body_profile=updated.get("body_profile"),
        style_preferences=updated.get("style_preferences"),
        cultural_preferences=updated.get("cultural_preferences"),
        theme=updated.get("theme", "midnight"),
        created_at=updated.get("created_at"),
    )
