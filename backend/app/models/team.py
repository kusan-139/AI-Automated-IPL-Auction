from sqlalchemy import Column, String, Float, Integer, Enum, JSON, DateTime, ForeignKey, Boolean
from app.models.guid import GUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class StrategyProfile(str, enum.Enum):
    AGGRESSIVE = "aggressive"
    BALANCED = "balanced"
    CONSERVATIVE = "conservative"

class Team(Base):
    __tablename__ = "team"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False, unique=True)
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    
    total_budget = Column(Float, nullable=False, default=1200000000) # 120 Cr
    remaining_budget = Column(Float, nullable=False, default=1200000000)
    max_squad_size = Column(Integer, nullable=False, default=25)
    current_squad_size = Column(Integer, default=0)
    
    retained_players_json = Column(JSON, nullable=True)
    strategy_profile = Column(Enum(StrategyProfile), default=StrategyProfile.BALANCED)
    
    home_ground = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    coach = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    squad_slots = relationship("TeamSquadSlot", back_populates="team", cascade="all, delete-orphan")

class TeamSquadSlot(Base):
    __tablename__ = "team_squad_slot"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    team_id = Column(GUID(), ForeignKey("team.id"), nullable=False)
    player_id = Column(GUID(), ForeignKey("player.id"), nullable=False)

    
    role = Column(String, nullable=True) # Player role at time of purchase
    purchase_price = Column(Float, nullable=False)
    purchase_round = Column(Integer, nullable=True)
    is_retained = Column(Boolean, default=False)
    
    team = relationship("Team", back_populates="squad_slots")
