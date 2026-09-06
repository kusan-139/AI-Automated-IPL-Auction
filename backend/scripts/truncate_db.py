import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import async_session_maker

async def truncate():
    async with async_session_maker() as session:
        print("Truncating player table with cascade...")
        await session.execute(text("TRUNCATE TABLE player CASCADE"))
        await session.commit()
        print("Truncated!")

if __name__ == "__main__":
    asyncio.run(truncate())
