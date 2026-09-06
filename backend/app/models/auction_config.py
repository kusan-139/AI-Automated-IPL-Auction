from sqlalchemy import Column, String, Integer, Float, Boolean, Enum, JSON, DateTime
from app.models.guid import GUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class FormatType(str, enum.Enum):
    MEGA = "mega"
    GENERIC = "generic"

class AuctionFormat(Base):
    __tablename__ = "auction_format"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    format_type = Column(Enum(FormatType), default=FormatType.GENERIC)
    is_default = Column(Boolean, default=False)
    
    salary_cap = Column(Float, nullable=False, default=1200000000) # 120 Cr default
    max_squad_size = Column(Integer, nullable=False, default=25)
    max_overseas = Column(Integer, nullable=False, default=8)
    max_overseas_playing = Column(Integer, nullable=False, default=4)
    
    retention_rules_json = Column(JSON, nullable=True)
    bid_increment_tiers_json = Column(JSON, nullable=True)
    player_set_order_json = Column(JSON, nullable=True)
    
    rtm_enabled = Column(Boolean, default=False)
    rtm_rules_json = Column(JSON, nullable=True)
    
    unsold_reentry_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
