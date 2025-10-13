# app/api/v1/endpoints/users.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import timedelta
from app.schemas.user import UserCreate, UserUpdate, UserInDB, UserLogin, Token
from app.services import user_service
from app.core.security import (
    create_access_token, 
    get_current_user, 
    require_l2_permission,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(
    user: UserCreate,
    current_user: dict = Depends(require_l2_permission)
):
    """
    Register a new user. Only L2 users can create new users.
    """
    try:
        new_user = user_service.create_user(user)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin):
    """
    Authenticate user and return access token.
    """
    user = user_service.authenticate_user(
        user_credentials.username, 
        user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "level": user["level"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserInDB)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current logged-in user information.
    """
    user = user_service.get_user_by_username(current_user["username"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserInDB])
def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Get all users. Available to all authenticated users.
    """
    users = user_service.get_all_users()
    return users

@router.get("/{user_id}", response_model=UserInDB)
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get a specific user by ID. Available to all authenticated users.
    """
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserInDB)
def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(require_l2_permission)
):
    """
    Update a user. Only L2 users can update users.
    """
    try:
        updated_user = user_service.update_user(user_id, user_update)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: str,
    current_user: dict = Depends(require_l2_permission)
):
    """
    Delete (deactivate) a user. Only L2 users can delete users.
    """
    try:
        result = user_service.delete_user(user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))