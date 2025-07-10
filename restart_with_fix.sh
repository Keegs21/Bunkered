#!/bin/bash
echo "🔄 Restarting Bunkered with referral code fixes..."

# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build -d

echo "✅ Containers restarted!"

# Set up database
echo "🗄️ Setting up database with referral codes..."
docker exec bunkered-backend-1 python setup_beta.py

echo "🎯 Setup complete! You can now test registration at http://localhost:3000"
echo ""
echo "Available test referral codes:"
echo "  - BETA2024 (50 uses)"
echo "  - TESTUSER (10 uses)" 
echo "  - FRIEND (5 uses)"
echo ""
echo "Or register without a referral code (optional field now)" 