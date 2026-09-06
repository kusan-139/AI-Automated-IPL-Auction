from sqlalchemy import Column, String, ForeignKey, DateTime
from app.models.guid import GUID
from sqlalchemy.orm import relationship
import datetime
import uuid

from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    # In Supabase, this references auth.users(id)
    user_id = Column(GUID(), unique=True, nullable=False)
    
    display_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    custom_team_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Can link to an existing Team in the system
    franchise_id = Column(GUID(), ForeignKey("team.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship to team
    team = relationship("Team", backref="profiles")
