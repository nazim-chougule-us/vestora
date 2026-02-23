"""
Vestora Backend — Social routes: post, vote, feed, leaderboard.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from app.database import social_posts_collection
from app.dependencies import get_current_user
from app.utils.helpers import utc_now, to_object_id
from app.utils.image_utils import get_signed_url

router = APIRouter()


class PostCreate(BaseModel):
    image_key: str
    caption: str = Field("", max_length=500)
    outfit_id: str | None = None


@router.post("/post", status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    current_user: dict = Depends(get_current_user),
):
    """Share a wardrobe image to the social feed."""
    # Validate image_key belongs to this user's wardrobe
    from app.database import wardrobe_items_collection
    owns = await wardrobe_items_collection().find_one(
        {"user_id": current_user["_id"], "image_key": body.image_key}
    )
    if not owns:
        raise HTTPException(status_code=403, detail="You can only share your own images")

    doc = {
        "user_id": current_user["_id"],
        "user_name": current_user.get("name", "Anonymous"),
        "image_key": body.image_key,
        "caption": body.caption,
        "outfit_id": body.outfit_id,
        "votes": 0,
        "voters": [],
        "created_at": utc_now().isoformat(),
    }
    result = await social_posts_collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"id": str(doc["_id"]), "message": "Posted!"}


@router.get("/feed")
async def social_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get the social feed of outfit posts."""
    col = social_posts_collection()
    total = await col.count_documents({})
    cursor = col.find({}).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    posts = []
    for d in docs:
        image_url = ""
        if d.get("image_key"):
            try:
                image_url = get_signed_url(d["image_key"])
            except Exception:
                pass
        posts.append({
            "id": str(d["_id"]),
            "user_name": d.get("user_name", "Anonymous"),
            "image_url": image_url,
            "caption": d.get("caption", ""),
            "votes": d.get("votes", 0),
            "voted_by_me": str(current_user["_id"]) in d.get("voters", []),
            "created_at": d.get("created_at", ""),
        })

    return {"posts": posts, "total": total}


@router.post("/vote/{post_id}")
async def vote_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Toggle vote on a social post."""
    col = social_posts_collection()
    oid = to_object_id(post_id)
    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")

    user_str = str(current_user["_id"])
    voters = doc.get("voters", [])

    if user_str in voters:
        await col.update_one({"_id": oid}, {"$inc": {"votes": -1}, "$pull": {"voters": user_str}})
        return {"voted": False}
    else:
        await col.update_one({"_id": oid}, {"$inc": {"votes": 1}, "$push": {"voters": user_str}})
        return {"voted": True}


@router.get("/leaderboard")
async def leaderboard(
    current_user: dict = Depends(get_current_user),
):
    """Get top users by total votes received."""
    col = social_posts_collection()
    pipeline = [
        {"$group": {"_id": "$user_name", "total_votes": {"$sum": "$votes"}, "post_count": {"$sum": 1}}},
        {"$sort": {"total_votes": -1}},
        {"$limit": 20},
    ]
    results = []
    async for doc in col.aggregate(pipeline):
        results.append({
            "user_name": doc["_id"],
            "total_votes": doc["total_votes"],
            "post_count": doc["post_count"],
        })
    return {"leaderboard": results}
