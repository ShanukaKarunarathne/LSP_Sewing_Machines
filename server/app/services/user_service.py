# app/services/user_service.py
from datetime import datetime
from typing import Optional
from app.db.firebase_config import db
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

users_collection = db.collection('users')

def create_user(user_data: UserCreate):
    """Create a new user with hashed password."""
    # Check if username already exists
    existing_users = users_collection.where("username", "==", user_data.username).limit(1).get()
    if len(list(existing_users)) > 0:
        raise ValueError("Username already exists")
    
    doc_ref = users_collection.document()
    
    user_dict = {
        "username": user_data.username,
        "full_name": user_data.full_name,
        "level": user_data.level,
        "hashed_password": get_password_hash(user_data.password),
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    
    doc_ref.set(user_dict)
    
    # Return user data without password
    return {
        "id": doc_ref.id,
        "username": user_dict["username"],
        "full_name": user_dict["full_name"],
        "level": user_dict["level"],
        "is_active": user_dict["is_active"],
        "created_at": user_dict["created_at"]
    }

def get_user_by_username(username: str) -> Optional[dict]:
    """Retrieve a user by username."""
    users = users_collection.where("username", "==", username).limit(1).stream()
    for doc in users:
        return {"id": doc.id, **doc.to_dict()}
    return None

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Retrieve a user by ID."""
    doc = users_collection.document(user_id).get()
    if doc.exists:
        user_data = doc.to_dict()
        # Remove hashed_password from response
        user_data.pop("hashed_password", None)
        return {"id": doc.id, **user_data}
    return None

def get_all_users():
    """Retrieve all users."""
    users = []
    docs = users_collection.stream()
    for doc in docs:
        user_data = doc.to_dict()
        # Remove hashed_password from response
        user_data.pop("hashed_password", None)
        users.append({"id": doc.id, **user_data})
    return users

def update_user(user_id: str, user_update: UserUpdate):
    """Update user information."""
    user_ref = users_collection.document(user_id)
    
    if not user_ref.get().exists:
        raise ValueError("User not found")
    
    update_data = {}
    
    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
    
    if user_update.level is not None:
        update_data["level"] = user_update.level
    
    if user_update.password is not None:
        update_data["hashed_password"] = get_password_hash(user_update.password)
    
    if not update_data:
        raise ValueError("No data to update")
    
    user_ref.update(update_data)
    return get_user_by_id(user_id)

def delete_user(user_id: str):
    """Delete a user (soft delete by marking inactive)."""
    user_ref = users_collection.document(user_id)
    
    if not user_ref.get().exists:
        raise ValueError("User not found")
    
    user_ref.update({"is_active": False})
    return {"status": "success", "message": f"User {user_id} deactivated."}

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate a user with username and password."""
    user = get_user_by_username(username)
    
    if not user:
        return None
    
    if not user.get("is_active", False):
        return None
    
    if not verify_password(password, user["hashed_password"]):
        return None
    
    # Remove hashed_password before returning
    user.pop("hashed_password", None)
    return user