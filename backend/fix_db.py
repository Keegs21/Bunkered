#!/usr/bin/env python3
"""Fix database by adding missing referral_code_id column"""

import os
import psycopg2

try:
    # Connect to PostgreSQL using environment variables
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://bunkered_user:bunkered_password@postgres:5432/bunkered_db')
    
    print("🔄 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("🗄️ Adding missing referral_code_id column...")
    
    # Check if column exists
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='referral_code_id'
    """)
    
    if not cursor.fetchone():
        print("   Adding referral_code_id column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN referral_code_id INTEGER")
        print("   ✅ Column added!")
    else:
        print("   ✅ Column already exists!")
    
    # Create referral_codes table if it doesn't exist
    print("📝 Creating referral_codes table...")
    cursor.execute("""
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
    """)
    print("   ✅ Table created/exists!")
    
    # Insert sample referral codes
    print("🎯 Adding sample referral codes...")
    codes = [
        ("BETA2024", "General beta access", 50),
        ("TESTUSER", "Test user access", 10),
        ("FRIEND", "Friend referral", 5)
    ]
    
    for code, desc, max_uses in codes:
        cursor.execute("""
            INSERT INTO referral_codes (code, description, max_uses, is_active)
            VALUES (%s, %s, %s, TRUE)
            ON CONFLICT (code) DO NOTHING
        """, (code, desc, max_uses))
    
    # Commit changes
    conn.commit()
    
    # Display available codes
    cursor.execute("SELECT code, current_uses, max_uses FROM referral_codes WHERE is_active = TRUE")
    codes = cursor.fetchall()
    
    print("\n✅ Database migration complete!")
    print("\n📋 Available referral codes:")
    for code, current, max_uses in codes:
        print(f"  {code}: {current}/{max_uses} uses")
    
    cursor.close()
    conn.close()
    
    print("\n🎯 You can now register accounts successfully!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc() 