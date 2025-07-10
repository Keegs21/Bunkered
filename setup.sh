#!/bin/bash

echo "🏌️  Setting up Bunkered - Golf Statistics & Betting Platform"
echo "=============================================================="

# Check if Python 3.11+ is installed
if ! python3 --version | grep -E "3\.(11|12)" > /dev/null; then
    echo "❌ Python 3.11+ is required. Please install Python 3.11 or later."
    exit 1
fi

# Check if Node.js 18+ is installed
if ! node --version | grep -E "v(18|19|20|21)" > /dev/null; then
    echo "❌ Node.js 18+ is required. Please install Node.js 18 or later."
    exit 1
fi

echo "✅ Python and Node.js versions are compatible"

# Setup Backend
echo ""
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bunkered
DATABASE_URL_TEST=sqlite:///./test.db

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs (Add your API keys here)
DATAGOLF_API_KEY=your-datagolf-api-key
ODDS_API_KEY=your-odds-api-key
NEWS_API_KEY=your-news-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Application
DEBUG=True
PROJECT_NAME=Bunkered API
VERSION=1.0.0
EOF
    echo "✅ Created .env file - please add your API keys"
fi

cd ..

# Setup Frontend
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF
    echo "✅ Created frontend .env file"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start PostgreSQL and Redis (or use Docker: docker-compose up postgres redis)"
echo "2. Run the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "3. Run the frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🔑 Don't forget to:"
echo "- Add your API keys to backend/.env"
echo "- Create the database tables: cd backend && alembic upgrade head"
echo ""
echo "📚 Documentation: See README.md for detailed instructions" 