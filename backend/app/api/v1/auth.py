from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.auth.jwt_bearer import get_current_user, CurrentUser
from app.auth.rbac import require_role
from app.auth.supabase_client import supabase
from app.auth.models import FranchiseUser
from app.schemas.auth import UserLogin, UserRegister, RoleUpdate, FranchiseUserResponse, TokenResponse
import uuid

router = APIRouter()

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return response.model_dump()
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/register", response_model=FranchiseUserResponse)
async def register_user(
    user_data: UserRegister, 
    current_user: CurrentUser = Depends(require_role("owner")),
    db: AsyncSession = Depends(get_db)
):
    franchise_id = user_data.franchise_id or current_user.franchise_id
    
    if not franchise_id:
        raise HTTPException(status_code=400, detail="Franchise ID is required")
    
    try:
        # Create user in Supabase auth
        auth_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "role": user_data.role,
                "franchise_id": str(franchise_id),
                "display_name": user_data.display_name
            }
        })
        
        user_id = auth_response.user.id
        
        # Create user in our DB
        new_user = FranchiseUser(
            id=uuid.UUID(user_id),
            franchise_id=franchise_id,
            role=user_data.role,
            display_name=user_data.display_name
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=FranchiseUserResponse)
async def get_me(current_user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FranchiseUser).where(FranchiseUser.id == current_user.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users", response_model=list[FranchiseUserResponse])
async def list_users(current_user: CurrentUser = Depends(require_role("owner")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FranchiseUser).where(FranchiseUser.franchise_id == current_user.franchise_id))
    return result.scalars().all()

@router.patch("/users/{user_id}/role", response_model=FranchiseUserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    role_data: RoleUpdate,
    current_user: CurrentUser = Depends(require_role("owner")),
    db: AsyncSession = Depends(get_db)
):
    # Verify user belongs to same franchise
    result = await db.execute(select(FranchiseUser).where(FranchiseUser.id == user_id))
    user = result.scalars().first()
    
    if not user or user.franchise_id != current_user.franchise_id:
        raise HTTPException(status_code=404, detail="User not found in your franchise")
        
    try:
        # Update in Supabase
        supabase.auth.admin.update_user_by_id(
            str(user_id),
            {"user_metadata": {"role": role_data.role}}
        )
        
        # Update in DB
        user.role = role_data.role
        await db.commit()
        await db.refresh(user)
        
        return user
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
