"""
Vestora Backend — Dependency injection helpers.
Provides reusable FastAPI dependencies for authentication and database access.
"""

from fastapi import HTTPException, status, Request
from app.utils.security import decode_access_token
from app.database import users_collection
from bson import ObjectId
from bson.errors import InvalidId


async def get_current_user(request: Request) -> dict:
    """
    Extract and validate the JWT from the Authorization header or httpOnly cookie.
    Only accepts ACCESS tokens (type="access"). Refresh tokens are rejected.
    Returns the full user document from MongoDB.
    """
    token: str | None = None

    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

    # Fall back to httpOnly cookie
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # decode_access_token validates signature, expiry, AND type="access"
    payload = decode_access_token(token)
    user_id = payload["sub"]

    # Safe ObjectId conversion
    try:
        oid = ObjectId(user_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await users_collection().find_one({"_id": oid})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Convert ObjectId to string for serialization
    user["_id"] = str(user["_id"])
    return user
