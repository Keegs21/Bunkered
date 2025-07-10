#!/usr/bin/env python3
"""
Utility script to create referral codes for beta access.
Run this script to generate referral codes for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine
from app.database import models
from datetime import datetime, timedelta

def create_referral_codes():
    db = SessionLocal()
    try:
        # Create some sample referral codes
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
                "expires_at": None  # No expiration
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
                print(f"Code '{code_data['code']}' already exists, skipping...")
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
            print(f"Created referral code: {code_data['code']} (max uses: {code_data['max_uses']})")
        
        db.commit()
        print(f"\n✅ Successfully created {created_count} referral codes!")
        
        # Display all active codes
        print("\n📋 All active referral codes:")
        print("-" * 60)
        active_codes = db.query(models.ReferralCode).filter(
            models.ReferralCode.is_active == True
        ).all()
        
        for code in active_codes:
            expires_str = code.expires_at.strftime("%Y-%m-%d") if code.expires_at else "Never"
            print(f"Code: {code.code:<12} | Uses: {code.current_uses}/{code.max_uses} | Expires: {expires_str}")
        
    except Exception as e:
        print(f"❌ Error creating referral codes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔑 Creating referral codes for beta access...")
    print("=" * 50)
    
    # Create database tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    
    create_referral_codes()
    
    print("\n🎯 You can now use these codes to register new users!")
    print("💡 To test: Use any of the codes above in the registration form.") 