#!/usr/bin/env python3
"""
Make User Admin Script

This script promotes an existing user to admin status by setting is_superuser = True.
Use this to bootstrap the first admin account.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database import models

def make_user_admin(identifier: str):
    """
    Make a user an admin by username or email
    
    Args:
        identifier: Username or email of the user to promote
    """
    db = SessionLocal()
    
    try:
        # Try to find user by username first, then by email
        user = db.query(models.User).filter(
            models.User.username == identifier
        ).first()
        
        if not user:
            user = db.query(models.User).filter(
                models.User.email == identifier
            ).first()
        
        if not user:
            print(f"❌ User not found: {identifier}")
            print("Available users:")
            users = db.query(models.User).all()
            for u in users:
                admin_status = "👑 ADMIN" if getattr(u, 'is_superuser', False) else "👤 USER"
                print(f"   - {u.username} ({u.email}) - {admin_status}")
            return False
        
        # Check if already admin
        if getattr(user, 'is_superuser', False):
            print(f"✅ User {user.username} is already an admin!")
            return True
        
        # Make admin
        print(f"🚀 Promoting {user.username} ({user.email}) to admin...")
        setattr(user, 'is_superuser', True)
        db.commit()
        
        print(f"✅ Successfully made {user.username} an admin!")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Admin Status: {'👑 ADMIN' if getattr(user, 'is_superuser', False) else '👤 USER'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_all_users():
    """List all users in the database"""
    db = SessionLocal()
    
    try:
        users = db.query(models.User).all()
        print(f"\n📋 All Users ({len(users)} total):")
        print("-" * 60)
        
        for user in users:
            admin_status = "👑 ADMIN" if getattr(user, 'is_superuser', False) else "👤 USER"
            active_status = "✅ ACTIVE" if getattr(user, 'is_active', True) else "❌ INACTIVE"
            print(f"{user.id:2d}. {user.username:15s} | {user.email:25s} | {admin_status} | {active_status}")
            
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🎯 Make User Admin Script")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <username_or_email>")
        print("   or: python make_admin.py --list")
        print("\nExamples:")
        print("   python make_admin.py john_doe")
        print("   python make_admin.py john@example.com")
        print("   python make_admin.py --list")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_all_users()
    else:
        identifier = sys.argv[1]
        success = make_user_admin(identifier)
        
        if success:
            print("\n🎉 Admin promotion complete!")
            print("You can now:")
            print("   1. Restart the frontend application")
            print("   2. Log out and log back in")
            print("   3. Look for 'User Administration' in your profile menu")
        else:
            print("\n💡 Tip: Use --list to see all available users") 