from pydantic import BaseModel
from typing import Optional, Any
import uuid
from datetime import datetime
from app.models.auction_config import FormatType

class AuctionFormatBase(BaseModel):
    name: str
    format_type: FormatType = FormatType.GENERIC
    is_default: bool = False
    
    salary_cap: float = 1200000000
    max_squad_size: int = 25
    max_overseas: int = 8
    max_overseas_playing: int = 4
    
    retention_rules_json: Optional[Any] = None
    bid_increment_tiers_json: Optional[Any] = None
    player_set_order_json: Optional[Any] = None
    
    rtm_enabled: bool = False
    rtm_rules_json: Optional[Any] = None
    unsold_reentry_enabled: bool = True

class AuctionFormatCreate(AuctionFormatBase):
    pass

class AuctionFormatUpdate(BaseModel):
    name: Optional[str] = None
    is_default: Optional[bool] = None
    salary_cap: Optional[float] = None
    max_squad_size: Optional[int] = None
    max_overseas: Optional[int] = None
    retention_rules_json: Optional[Any] = None
    bid_increment_tiers_json: Optional[Any] = None
    player_set_order_json: Optional[Any] = None
    rtm_enabled: Optional[bool] = None
    rtm_rules_json: Optional[Any] = None
    unsold_reentry_enabled: Optional[bool] = None

class AuctionFormatResponse(AuctionFormatBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
