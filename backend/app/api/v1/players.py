from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
from app.database import get_db
from app.auth.jwt_bearer import get_current_user, CurrentUser
from app.models.player import Player, PlayerRole
from app.schemas.player import PlayerResponse, PaginatedPlayers
import redis.asyncio as redis
from app.dependencies import get_redis_client
from app.services.cache_service import CacheService

router = APIRouter()

@router.get("/", response_model=PaginatedPlayers)
async def list_players(
    role: Optional[PlayerRole] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    from sqlalchemy import func, or_
    
    query = select(Player)
    
    if role:
        query = query.where(Player.role == role)
    if min_price is not None:
        query = query.where(Player.base_price >= min_price)
    if max_price is not None:
        query = query.where(Player.base_price <= max_price)
    if search:
        query = query.where(
            or_(
                Player.name.ilike(f"%{search}%"),
                Player.specialization.ilike(f"%{search}%")
            )
        )
        
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Get paginated items
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    players = result.scalars().all()
    
    return PaginatedPlayers(
        items=players,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    cache_key = f"player:{player_id}"
    cache = CacheService(redis_client)
    cached = await cache.get(cache_key)
    
    if cached:
        return cached

    result = await db.execute(select(Player).where(Player.id == player_id))
    player = result.scalars().first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    await cache.set(cache_key, player, ttl_seconds=300)
    return player
