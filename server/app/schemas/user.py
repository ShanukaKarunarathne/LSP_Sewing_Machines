# app/schemas/user.py
from pydantic import BaseModel, Field
from typing import Optional, Literal

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str
    level: Literal["L1", "L2"] = Field(..., description="L1: Read/Write, L2: Full CRUD")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    level: Optional[Literal["L1", "L2"]] = None

class UserInDB(UserBase):
    id: str
    created_at: str
    is_active: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserInDB

class TokenData(BaseModel):
    username: Optional[str] = None
    level: Optional[str] = None