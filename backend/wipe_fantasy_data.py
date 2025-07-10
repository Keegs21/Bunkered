#!/usr/bin/env python3
"""
Wipe Fantasy League Data Script

This script deletes ALL fantasy league data from the database to start fresh
with the new advanced scoring system. Use with caution!

This will delete:
- All weekly lineups
- All fantasy entries 
- All fantasy teams
- All league memberships
- All fantasy pools
- All fantasy leagues

This will NOT delete:
- Users
- Players
- Tournaments
- Bets
- Tournament results
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database import models

def confirm_deletion():
    """Ask for confirmation before wiping data"""
    print("⚠️  WARNING: This will delete ALL fantasy league data!")
    print("📋 Data to be deleted:")
    print("   - All weekly lineups")
    print("   - All fantasy entries")
    print("   - All fantasy teams") 
    print("   - All league memberships")
    print("   - All fantasy pools")
    print("   - All fantasy leagues")
    print()
    print("🔒 This will NOT delete users, players, tournaments, or bets")
    print()
    
    response = input("Are you sure you want to continue? Type 'DELETE' to confirm: ")
    return response == "DELETE"

def get_table_counts(db: Session):
    """Get current record counts"""
    counts = {}
    counts['weekly_lineups'] = db.query(models.WeeklyLineup).count()
    counts['fantasy_entries'] = db.query(models.FantasyEntry).count()
    counts['fantasy_teams'] = db.query(models.FantasyTeam).count()
    counts['league_memberships'] = db.query(models.LeagueMembership).count()
    counts['fantasy_pools'] = db.query(models.FantasyPool).count()
    counts['fantasy_leagues'] = db.query(models.FantasyLeague).count()
    return counts

def wipe_fantasy_data():
    """Delete all fantasy league data in the correct order"""
    if not confirm_deletion():
        print("❌ Operation cancelled")
        return
    
    db = SessionLocal()
    try:
        print("\n🔄 Starting fantasy data cleanup...")
        
        # Show current counts
        print("\n📊 Current record counts:")
        counts = get_table_counts(db)
        for table, count in counts.items():
            print(f"   {table}: {count}")
        
        if sum(counts.values()) == 0:
            print("\n✅ No fantasy data found - database is already clean!")
            return
        
        print(f"\n🗑️  Deleting {sum(counts.values())} total records...")
        
        # Delete in correct order to avoid foreign key constraints
        
        # 1. Delete weekly lineups (child of teams and tournaments)
        if counts['weekly_lineups'] > 0:
            print(f"   Deleting {counts['weekly_lineups']} weekly lineups...")
            db.query(models.WeeklyLineup).delete()
            db.commit()
            print("   ✅ Weekly lineups deleted")
        
        # 2. Delete fantasy entries (child of pools and users)
        if counts['fantasy_entries'] > 0:
            print(f"   Deleting {counts['fantasy_entries']} fantasy entries...")
            db.query(models.FantasyEntry).delete()
            db.commit()
            print("   ✅ Fantasy entries deleted")
        
        # 3. Delete fantasy teams (child of leagues and users)
        if counts['fantasy_teams'] > 0:
            print(f"   Deleting {counts['fantasy_teams']} fantasy teams...")
            db.query(models.FantasyTeam).delete()
            db.commit()
            print("   ✅ Fantasy teams deleted")
        
        # 4. Delete league memberships (child of leagues and users)
        if counts['league_memberships'] > 0:
            print(f"   Deleting {counts['league_memberships']} league memberships...")
            db.query(models.LeagueMembership).delete()
            db.commit()
            print("   ✅ League memberships deleted")
        
        # 5. Delete fantasy pools (child of leagues and tournaments)
        if counts['fantasy_pools'] > 0:
            print(f"   Deleting {counts['fantasy_pools']} fantasy pools...")
            db.query(models.FantasyPool).delete()
            db.commit()
            print("   ✅ Fantasy pools deleted")
        
        # 6. Delete fantasy leagues (parent table)
        if counts['fantasy_leagues'] > 0:
            print(f"   Deleting {counts['fantasy_leagues']} fantasy leagues...")
            db.query(models.FantasyLeague).delete()
            db.commit()
            print("   ✅ Fantasy leagues deleted")
        
        # Verify cleanup
        print("\n🔍 Verifying cleanup...")
        final_counts = get_table_counts(db)
        total_remaining = sum(final_counts.values())
        
        if total_remaining == 0:
            print("✅ All fantasy data successfully deleted!")
            print("\n🎯 You can now create your first test league with the new scoring system!")
            print("\n💡 Next steps:")
            print("   1. Start the backend server")
            print("   2. Log in as admin")
            print("   3. Create a new league in the frontend")
            print("   4. Test the advanced logarithmic scoring system")
        else:
            print(f"⚠️  {total_remaining} records still remain:")
            for table, count in final_counts.items():
                if count > 0:
                    print(f"   {table}: {count}")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    wipe_fantasy_data() 