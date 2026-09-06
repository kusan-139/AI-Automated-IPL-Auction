import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from typing import Optional
import uuid
from app.config import get_settings

settings = get_settings()
security = HTTPBearer(auto_error=False)

class CurrentUser(BaseModel):
    user_id: uuid.UUID
    franchise_id: Optional[uuid.UUID]
    role: Optional[str]
    email: Optional[str]

DEFAULT_DEV_USER = CurrentUser(
    user_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
    franchise_id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
    role="admin",
    email="admin@iplauction.ai"
)

def verify_jwt(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> CurrentUser:
    if not credentials:
        if settings.DEV_MODE or settings.ENVIRONMENT == "development":
            return DEFAULT_DEV_USER
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    token = credentials.credentials
    try:
        # Supabase signs JWTs with the SUPABASE_JWT_SECRET
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        
        user_metadata = payload.get("user_metadata", {})
        
        return CurrentUser(
            user_id=uuid.UUID(payload.get("sub", "00000000-0000-0000-0000-000000000001")),
            franchise_id=uuid.UUID(user_metadata.get("franchise_id")) if user_metadata.get("franchise_id") else None,
            role=user_metadata.get("role", "viewer"),
            email=payload.get("email")
        )
    except jwt.ExpiredSignatureError:
        if settings.DEV_MODE or settings.ENVIRONMENT == "development":
            return DEFAULT_DEV_USER
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        if settings.DEV_MODE or settings.ENVIRONMENT == "development":
            return DEFAULT_DEV_USER
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(user: CurrentUser = Security(verify_jwt)) -> CurrentUser:
    return user

