from pydantic import BaseModel
from typing import Optional, Any
import uuid
from datetime import datetime
from app.models.player import PlayerRole

class PlayerBase(BaseModel):
    name: str
    nationality: str
    role: PlayerRole
    specialization: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    age: int
    ipl_experience_years: int = 0
    base_price: float
    current_team_id: Optional[uuid.UUID] = None
    
    batting_avg: Optional[float] = None
    strike_rate: Optional[float] = None
    bowling_avg: Optional[float] = None
    economy: Optional[float] = None
    wickets: int = 0
    runs: int = 0
    matches_played: int = 0
    catches: int = 0
    stumpings: int = 0
    run_outs: int = 0
    
    fitness_score: Optional[float] = None
    injury_history_json: Optional[Any] = None
    workload_index: Optional[float] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    # Make all fields optional for update
    pass

class PlayerResponse(PlayerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedPlayers(BaseModel):
    items: list[PlayerResponse]
    total: int
    skip: int
    limit: int

