# create_admin.py
"""
Run this script once to create the initial admin user (L2).
Usage: python create_admin.py
"""
from app.services.user_service import create_user
from app.schemas.user import UserCreate

def create_initial_admin():
    try:
        admin_user = UserCreate(
            username="admin",
            password="admin123",  # Change this!
            full_name="System Administrator",
            level="L2"
        )
        
        result = create_user(admin_user)
        print("✅ Admin user created successfully!")
        print(f"Username: {result['username']}")
        print(f"Level: {result['level']}")
        print("\n⚠️  IMPORTANT: Please change the default password after first login!")
        
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("Admin user may already exist.")

if __name__ == "__main__":
    create_initial_admin()