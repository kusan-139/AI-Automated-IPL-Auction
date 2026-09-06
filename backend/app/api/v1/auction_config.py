from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid
from app.database import get_db
from app.auth.jwt_bearer import get_current_user, CurrentUser
from app.auth.rbac import require_role
from app.models.auction_config import AuctionFormat
from app.schemas.auction_config import AuctionFormatResponse, AuctionFormatCreate

router = APIRouter()

@router.get("/", response_model=List[AuctionFormatResponse])
async def list_formats(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AuctionFormat))
    return result.scalars().all()

@router.get("/{format_id}", response_model=AuctionFormatResponse)
async def get_format(
    format_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AuctionFormat).where(AuctionFormat.id == format_id))
    fmt = result.scalars().first()
    if not fmt:
        raise HTTPException(status_code=404, detail="Format not found")
    return fmt

@router.post("/", response_model=AuctionFormatResponse)
async def create_format(
    data: AuctionFormatCreate,
    current_user: CurrentUser = Depends(require_role("owner")),
    db: AsyncSession = Depends(get_db)
):
    fmt = AuctionFormat(**data.model_dump())
    db.add(fmt)
    await db.commit()
    await db.refresh(fmt)
    return fmt
