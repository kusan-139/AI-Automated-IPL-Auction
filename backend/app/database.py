from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()

db_url = settings.DB_URL
if db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
elif "postgresql" in db_url:
    connect_args = {"statement_cache_size": 0, "prepared_statement_cache_size": 0}

engine = create_async_engine(
    db_url,
    echo=(settings.ENVIRONMENT == "development"),
    future=True,
    connect_args=connect_args
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

