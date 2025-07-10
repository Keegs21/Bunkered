from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, tournaments, players, bets, fantasy, news

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tournaments.router, prefix="/tournaments", tags=["tournaments"])
api_router.include_router(players.router, prefix="/players", tags=["players"])
api_router.include_router(bets.router, prefix="/bets", tags=["bets"])
api_router.include_router(fantasy.router, prefix="/fantasy", tags=["fantasy"])
api_router.include_router(news.router, prefix="/news", tags=["news"]) 