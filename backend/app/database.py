"""
Vestora Backend — MongoDB async connection using Motor.
Provides a singleton database client and convenience accessors for collections.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

# Singleton client — created once, reused across the app
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Initialize the MongoDB connection and create indexes. Called on app startup."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]
    # Verify connectivity
    await _client.admin.command("ping")
    print(f"✓ Connected to MongoDB: {settings.mongodb_db_name}")

    # Create indexes (idempotent — safe to call every startup)
    await _db["users"].create_index("email", unique=True)
    await _db["wardrobe_items"].create_index([("user_id", 1), ("created_at", -1)])
    await _db["outfits"].create_index([("user_id", 1), ("created_at", -1)])
    await _db["feedback"].create_index([("user_id", 1), ("outfit_id", 1)])
    await _db["notifications"].create_index([("user_id", 1), ("read", 1), ("created_at", -1)])
    await _db["confidence_logs"].create_index([("user_id", 1), ("created_at", -1)])
    await _db["social_posts"].create_index([("created_at", -1)])
    await _db["otps"].create_index("expires_at", expireAfterSeconds=0)
    await _db["otps"].create_index([("email", 1), ("created_at", -1)])
    print("✓ MongoDB indexes ensured")


async def close_db() -> None:
    """Close the MongoDB connection. Called on app shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("✓ MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _db


# ---------------------------------------------------------------------------
# Collection accessors — one per MongoDB collection
# ---------------------------------------------------------------------------

def users_collection():
    return get_db()["users"]

def wardrobe_items_collection():
    return get_db()["wardrobe_items"]

def outfits_collection():
    return get_db()["outfits"]

def feedback_collection():
    return get_db()["feedback"]

def style_profiles_collection():
    return get_db()["style_profiles"]

def social_posts_collection():
    return get_db()["social_posts"]

def battles_collection():
    return get_db()["battles"]

def confidence_logs_collection():
    return get_db()["confidence_logs"]

def notifications_collection():
    return get_db()["notifications"]

def otps_collection():
    return get_db()["otps"]
