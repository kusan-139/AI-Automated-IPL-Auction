from sqlalchemy import Column, String, Integer, Float, Enum, DateTime, ForeignKey, Boolean
from app.models.guid import GUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class AuctionStatus(str, enum.Enum):
    PENDING = "pending"
    LIVE = "live"
    COMPLETED = "completed"

class EventType(str, enum.Enum):
    PLAYER_PRESENTED = "player_presented"
    BID = "bid"
    SOLD = "sold"
    UNSOLD = "unsold"
    RTM_EXERCISED = "rtm_exercised"
    RTM_DECLINED = "rtm_declined"

class AuctionSession(Base):
    __tablename__ = "auction_session"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    status = Column(Enum(AuctionStatus), default=AuctionStatus.PENDING)
    format_id = Column(GUID(), ForeignKey("auction_format.id"), nullable=False)
    total_rounds = Column(Integer, nullable=True)
    current_round = Column(Integer, default=1)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuctionEvent(Base):
    __tablename__ = "auction_event"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    auction_session_id = Column(GUID(), ForeignKey("auction_session.id"), nullable=False)
    player_id = Column(GUID(), ForeignKey("player.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    bid_amount = Column(Float, nullable=True)
    bidding_team_id = Column(GUID(), ForeignKey("team.id"), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AuctionResult(Base):
    __tablename__ = "auction_result"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(GUID(), ForeignKey("auction_session.id"), nullable=False)
    player_id = Column(GUID(), ForeignKey("player.id"), nullable=False)
    winning_team_id = Column(GUID(), ForeignKey("team.id"), nullable=True) # Null if unsold

    final_price = Column(Float, nullable=True)
    round_number = Column(Integer, nullable=True)
