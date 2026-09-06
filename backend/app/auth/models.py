from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base

class FranchiseUser(Base):
    __tablename__ = "franchise_user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, comment="Matches Supabase auth.users id")
    franchise_id = Column(UUID(as_uuid=True), ForeignKey("team.id"), nullable=True)
    role = Column(String, nullable=False, default="viewer")
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
