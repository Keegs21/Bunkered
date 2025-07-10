#!/usr/bin/env python3
"""
Database migration script to add referral code functionality.
This script adds the new referral_codes table and referral_code_id column to users table.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import SessionLocal, engine
from app.database import models
from datetime import datetime, timedelta

def migrate_database():
    """Add referral code functionality to existing database"""
    db = SessionLocal()
    try:
        print("🔄 Starting database migration for referral codes...")
        
        # Create all tables (this will create referral_codes table if it doesn't exist)
        models.Base.metadata.create_all(bind=engine)
        print("✅ Created/updated tables")
        
        # Check if referral_code_id column exists in users table
        try:
            result = db.execute(text("SELECT referral_code_id FROM users LIMIT 1"))
            print("✅ referral_code_id column already exists in users table")
        except Exception:
            print("➕ Adding referral_code_id column to users table...")
            try:
                db.execute(text("ALTER TABLE users ADD COLUMN referral_code_id INTEGER"))
                db.execute(text("ALTER TABLE users ADD CONSTRAINT fk_users_referral_code_id FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id)"))
                db.commit()
                print("✅ Successfully added referral_code_id column")
            except Exception as e:
                print(f"⚠️  Could not add foreign key constraint: {e}")
                print("   (This is normal if the constraint already exists)")
        
        # Create sample referral codes
        print("📝 Creating sample referral codes...")
        
        codes_to_create = [
            {
                "code": "BETA2024",
                "description": "General beta access code",
                "max_uses": 50,
                "expires_at": datetime.utcnow() + timedelta(days=30)
            },
            {
                "code": "EARLYBIRD",
                "description": "Early bird beta access",
                "max_uses": 25,
                "expires_at": datetime.utcnow() + timedelta(days=60)
            },
            {
                "code": "TESTUSER",
                "description": "Test user code",
                "max_uses": 5,
                "expires_at": None
            },
            {
                "code": "FRIEND",
                "description": "Friend referral code",
                "max_uses": 10,
                "expires_at": datetime.utcnow() + timedelta(days=90)
            }
        ]
        
        created_count = 0
        for code_data in codes_to_create:
            # Check if code already exists
            existing = db.query(models.ReferralCode).filter(
                models.ReferralCode.code == code_data["code"]
            ).first()
            
            if existing:
                print(f"   Code '{code_data['code']}' already exists, skipping...")
                continue
            
            # Create new referral code
            referral_code = models.ReferralCode(
                code=code_data["code"],
                description=code_data["description"],
                max_uses=code_data["max_uses"],
                expires_at=code_data["expires_at"],
                is_active=True,
                current_uses=0
            )
            
            db.add(referral_code)
            created_count += 1
            print(f"   ✅ Created referral code: {code_data['code']}")
        
        db.commit()
        print(f"✅ Migration completed! Created {created_count} new referral codes.")
        
        # Display all active codes
        print("\n📋 Available referral codes:")
        print("-" * 60)
        active_codes = db.query(models.ReferralCode).filter(
            models.ReferralCode.is_active == True
        ).all()
        
        for code in active_codes:
            expires_str = code.expires_at.strftime("%Y-%m-%d") if code.expires_at else "Never"
            print(f"Code: {code.code:<12} | Uses: {code.current_uses}/{code.max_uses} | Expires: {expires_str}")
        
        print("\n🎯 Migration complete! You can now register users with referral codes.")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database() 