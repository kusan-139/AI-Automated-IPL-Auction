from sqlalchemy import Column, String, Integer, Float, Enum, JSON, DateTime
from app.models.guid import GUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class PlayerRole(str, enum.Enum):
    BATSMAN = "Batsman"
    BOWLER = "Bowler"
    ALL_ROUNDER = "All-Rounder"
    WICKET_KEEPER = "Wicket-Keeper"

class Player(Base):
    __tablename__ = "player"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    nationality = Column(String, nullable=False)
    role = Column(Enum(PlayerRole), nullable=False)
    specialization = Column(String, nullable=True) # e.g. "Opening Batter", "Death Bowler"
    batting_style = Column(String, nullable=True)
    bowling_style = Column(String, nullable=True)
    age = Column(Integer, nullable=False)
    ipl_experience_years = Column(Integer, default=0)
    base_price = Column(Float, nullable=False)
    current_team_id = Column(GUID(), nullable=True) # Null if in auction pool

    
    # Stats
    batting_avg = Column(Float, nullable=True)
    strike_rate = Column(Float, nullable=True)
    bowling_avg = Column(Float, nullable=True)
    economy = Column(Float, nullable=True)
    wickets = Column(Integer, default=0)
    runs = Column(Integer, default=0)
    matches_played = Column(Integer, default=0)
    catches = Column(Integer, default=0)
    stumpings = Column(Integer, default=0)
    run_outs = Column(Integer, default=0)
    
    # ML Features
    fitness_score = Column(Float, nullable=True)
    injury_history_json = Column(JSON, nullable=True)
    workload_index = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
