#!/usr/bin/env python3
"""Simple script to set up beta access features"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy import text, create_engine
    from app.database.database import SQLALCHEMY_DATABASE_URL
    from datetime import datetime, timedelta
    
    print("🚀 Setting up beta access features...")
    
    # Create engine
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        # Create referral_codes table if it doesn't exist
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS referral_codes (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                created_by INTEGER,
                is_active BOOLEAN DEFAULT TRUE,
                max_uses INTEGER DEFAULT 1,
                current_uses INTEGER DEFAULT 0,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            )
        """))
        
        # Add referral_code_id column to users table if it doesn't exist
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN referral_code_id INTEGER"))
        except:
            pass  # Column already exists
        
        # Insert sample referral codes
        codes = [
            ("BETA2024", "General beta access", 50),
            ("TESTUSER", "Test user access", 10),
            ("FRIEND", "Friend referral", 5)
        ]
        
        for code, desc, max_uses in codes:
            connection.execute(text("""
                INSERT INTO referral_codes (code, description, max_uses, is_active)
                VALUES (:code, :desc, :max_uses, TRUE)
                ON CONFLICT (code) DO NOTHING
            """), {"code": code, "desc": desc, "max_uses": max_uses})
        
        connection.commit()
        
        # Display available codes
        result = connection.execute(text("SELECT code, current_uses, max_uses FROM referral_codes WHERE is_active = TRUE"))
        codes = result.fetchall()
        
        print("\n✅ Setup complete!")
        print("\n📋 Available referral codes:")
        for code, current, max_uses in codes:
            print(f"  {code}: {current}/{max_uses} uses")
        
        print("\n🎯 You can now register with any of these codes!")
        
except Exception as e:
    print(f"Setup failed: {e}")
    print("This is normal if running outside Docker. Use Docker to run the full application.") 