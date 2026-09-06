from pydantic import BaseModel
from typing import Optional, List, Any
import uuid
from datetime import datetime
from app.models.team import StrategyProfile

class TeamBase(BaseModel):
    name: str
    short_name: str
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    
    total_budget: float = 1200000000
    remaining_budget: float = 1200000000
    max_squad_size: int = 25
    current_squad_size: int = 0
    
    retained_players_json: Optional[Any] = None
    strategy_profile: StrategyProfile = StrategyProfile.BALANCED
    
    home_ground: Optional[str] = None
    owner: Optional[str] = None
    coach: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    remaining_budget: Optional[float] = None
    current_squad_size: Optional[int] = None
    strategy_profile: Optional[StrategyProfile] = None

class TeamResponse(TeamBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TeamSquadSlotBase(BaseModel):
    team_id: uuid.UUID
    player_id: uuid.UUID
    role: Optional[str] = None
    purchase_price: float
    purchase_round: Optional[int] = None
    is_retained: bool = False

class TeamSquadSlotResponse(TeamSquadSlotBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
