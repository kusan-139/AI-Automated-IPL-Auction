from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.models.auction import AuctionStatus, EventType

class AuctionSessionBase(BaseModel):
    name: str
    status: AuctionStatus = AuctionStatus.PENDING
    format_id: uuid.UUID
    total_rounds: Optional[int] = None
    current_round: int = 1

class AuctionSessionCreate(AuctionSessionBase):
    pass

class AuctionSessionUpdate(BaseModel):
    status: Optional[AuctionStatus] = None
    current_round: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class AuctionSessionResponse(AuctionSessionBase):
    id: uuid.UUID
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuctionEventBase(BaseModel):
    auction_session_id: uuid.UUID
    player_id: uuid.UUID
    event_type: EventType
    bid_amount: Optional[float] = None
    bidding_team_id: Optional[uuid.UUID] = None

class AuctionEventCreate(AuctionEventBase):
    pass

class AuctionEventResponse(AuctionEventBase):
    id: uuid.UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class AuctionResultBase(BaseModel):
    session_id: uuid.UUID
    player_id: uuid.UUID
    winning_team_id: Optional[uuid.UUID] = None
    final_price: Optional[float] = None
    round_number: Optional[int] = None

class AuctionResultCreate(AuctionResultBase):
    pass

class AuctionResultResponse(AuctionResultBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
