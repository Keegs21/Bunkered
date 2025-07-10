from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from app.database.models import BetStatus


class BetBase(BaseModel):
    tournament_id: Optional[int] = None
    player_id: Optional[int] = None
    bet_type: str
    amount: float
    odds: Optional[float] = None
    description: Optional[str] = None


class BetCreate(BetBase):
    pass


class BetUpdate(BaseModel):
    status: BetStatus
    description: Optional[str] = None


class BetResponse(BetBase):
    id: int
    user_id: int
    potential_payout: Optional[float] = None
    status: BetStatus
    placed_at: datetime
    settled_at: Optional[datetime] = None
    
    # Optional related data
    tournament: Optional[dict] = None
    player: Optional[dict] = None

    class Config:
        from_attributes = True


class BettingStats(BaseModel):
    total_bets: int
    won_bets: int
    lost_bets: int
    pending_bets: int
    win_percentage: float
    total_wagered: float
    total_winnings: float
    net_profit: float
    roi_percentage: float


class BettingAnalytics(BaseModel):
    daily_profit: List[dict]  # [{date, profit, cumulative_profit}]
    monthly_performance: List[dict]  # [{month, bets, wins, profit}]
    bet_type_performance: List[dict]  # [{type, count, win_rate, profit}]
    recent_form: List[dict]  # Last 10 bets performance
    win_rate_trend: List[dict]  # [{period, win_rate}] 