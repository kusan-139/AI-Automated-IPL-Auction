from fastapi import HTTPException, Depends
from app.auth.jwt_bearer import get_current_user, CurrentUser

ROLE_HIERARCHY = {
    "owner": 3,
    "analyst": 2,
    "coach": 1,
    "viewer": 0
}

def require_role(min_role: str):
    def role_checker(current_user: CurrentUser = Depends(get_current_user)):
        user_role_level = ROLE_HIERARCHY.get(current_user.role, 0)
        min_role_level = ROLE_HIERARCHY.get(min_role, 0)
        
        if user_role_level < min_role_level:
            raise HTTPException(
                status_code=403, 
                detail=f"Operation not permitted. Requires role: {min_role}"
            )
        return current_user
    return role_checker
