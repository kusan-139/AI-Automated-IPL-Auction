from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
import redis.asyncio as redis
from app.config import get_settings

settings = get_settings()

class InMemoryRedisFallback:
    def __init__(self):
        self._store = {}
    async def get(self, key: str):
        return self._store.get(key)
    async def setex(self, key: str, ttl: int, value: str):
        self._store[key] = value
    async def delete(self, key: str):
        self._store.pop(key, None)
    async def close(self):
        pass

async def get_redis_client():
    try:
        client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        # Test ping
        await client.ping()
        yield client
        await client.close()
    except Exception:
        # Fallback to in-memory mock client when Redis server is not running
        yield InMemoryRedisFallback()


