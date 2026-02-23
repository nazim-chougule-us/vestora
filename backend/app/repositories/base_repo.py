"""
Vestora Backend — Generic CRUD base repository for MongoDB collections.
All specific repositories inherit from this to avoid boilerplate.
"""

from typing import Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from app.utils.helpers import serialize_doc, utc_now


class BaseRepository:
    """Generic async CRUD operations for a MongoDB collection."""

    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create(self, data: dict) -> dict:
        """Insert a document and return it with its generated id."""
        data["created_at"] = utc_now().isoformat()
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return serialize_doc(data)

    async def get_by_id(self, doc_id: str) -> dict | None:
        """Find a single document by its _id."""
        doc = await self.collection.find_one({"_id": ObjectId(doc_id)})
        return serialize_doc(doc) if doc else None

    async def get_many(
        self,
        filter_query: dict | None = None,
        skip: int = 0,
        limit: int = 50,
        sort: list[tuple[str, int]] | None = None,
    ) -> list[dict]:
        """Return a paginated list of documents matching the filter."""
        cursor = self.collection.find(filter_query or {})
        if sort:
            cursor = cursor.sort(sort)
        cursor = cursor.skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [serialize_doc(d) for d in docs]

    async def get_by_user(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> list[dict]:
        """Return documents belonging to a specific user."""
        return await self.get_many(
            filter_query={"user_id": user_id},
            skip=skip,
            limit=limit,
            sort=[("created_at", -1)],
        )

    async def update(self, doc_id: str, update_data: dict) -> dict | None:
        """Partial update a document by _id. Returns the updated document."""
        update_data["updated_at"] = utc_now().isoformat()
        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data},
        )
        return await self.get_by_id(doc_id)

    async def delete(self, doc_id: str) -> bool:
        """Delete a document by _id. Returns True if deleted."""
        result = await self.collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count > 0

    async def count(self, filter_query: dict | None = None) -> int:
        """Count documents matching the filter."""
        return await self.collection.count_documents(filter_query or {})
