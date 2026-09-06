from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    role: str = "analyst"
    franchise_id: Optional[uuid.UUID] = None

class RoleUpdate(BaseModel):
    role: str

class FranchiseUserResponse(BaseModel):
    id: uuid.UUID
    franchise_id: Optional[uuid.UUID]
    role: str
    display_name: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: FranchiseUserResponse
