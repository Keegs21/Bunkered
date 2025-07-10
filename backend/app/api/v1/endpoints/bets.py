from typing import Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.api import deps
from app.database.database import get_db
from app.database import models
from app.schemas import BetCreate, BetUpdate, BetResponse, BettingStats, BettingAnalytics

router = APIRouter()


@router.get("/", response_model=List[BetResponse])
def read_user_bets(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve user's bets.
    """
    bets = db.query(models.Bet).filter(
        models.Bet.user_id == current_user.id
    ).order_by(models.Bet.placed_at.desc()).offset(skip).limit(limit).all()
    return bets


@router.post("/", response_model=BetResponse)
def create_bet(
    *,
    db: Session = Depends(get_db),
    tournament_id: Optional[int] = None,
    player_id: Optional[int] = None,
    bet_type: str,
    amount: float,
    odds: Optional[float] = None,
    description: Optional[str] = None,
    placed_at: Optional[datetime] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new bet.
    """
    potential_payout = amount * odds if odds else None
    
    db_bet = models.Bet(
        user_id=current_user.id,
        tournament_id=tournament_id,
        player_id=player_id,
        bet_type=bet_type,
        amount=amount,
        odds=odds,
        potential_payout=potential_payout,
        description=description,
        placed_at=placed_at or datetime.utcnow(),
    )
    db.add(db_bet)
    db.commit()
    db.refresh(db_bet)
    return db_bet


@router.put("/{bet_id}", response_model=BetResponse)
def update_bet(
    bet_id: int,
    bet_update: BetUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update bet status (mark as won/lost).
    """
    bet = db.query(models.Bet).filter(
        models.Bet.id == bet_id,
        models.Bet.user_id == current_user.id
    ).first()
    
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    
    # Use setattr to avoid type checking issues
    setattr(bet, 'status', bet_update.status)
    if bet_update.description:
        setattr(bet, 'description', bet_update.description)
    
    # Set settled_at timestamp when bet is resolved
    if bet_update.status in [models.BetStatus.WON, models.BetStatus.LOST, models.BetStatus.PUSHED]:
        setattr(bet, 'settled_at', datetime.utcnow())
    
    db.commit()
    db.refresh(bet)
    return bet


@router.get("/{bet_id}", response_model=BetResponse)
def read_bet(
    bet_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get bet by ID.
    """
    bet = db.query(models.Bet).filter(
        models.Bet.id == bet_id,
        models.Bet.user_id == current_user.id
    ).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    return bet


@router.delete("/{bet_id}")
def delete_bet(
    bet_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Delete a bet. Only the bet owner can delete their own bets.
    """
    bet = db.query(models.Bet).filter(
        models.Bet.id == bet_id,
        models.Bet.user_id == current_user.id
    ).first()
    
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    
    db.delete(bet)
    db.commit()
    return {"message": "Bet deleted successfully"}


@router.get("/stats/summary", response_model=BettingStats)
def get_betting_stats(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get user's betting statistics summary.
    """
    user_bets = db.query(models.Bet).filter(models.Bet.user_id == current_user.id).all()
    
    total_bets = len(user_bets)
    won_bets = len([b for b in user_bets if b.status == models.BetStatus.WON])
    lost_bets = len([b for b in user_bets if b.status == models.BetStatus.LOST])
    pending_bets = len([b for b in user_bets if b.status == models.BetStatus.PENDING])
    
    total_wagered = float(sum(bet.amount for bet in user_bets) if user_bets else 0)
    total_winnings = float(sum(bet.potential_payout or 0 for bet in user_bets if bet.status == models.BetStatus.WON) if user_bets else 0)
    net_profit = total_winnings - total_wagered
    
    win_percentage = (won_bets / total_bets * 100) if total_bets > 0 else 0.0
    roi_percentage = (net_profit / total_wagered * 100) if total_wagered > 0 else 0.0
    
    return BettingStats(
        total_bets=total_bets,
        won_bets=won_bets,
        lost_bets=lost_bets,
        pending_bets=pending_bets,
        win_percentage=win_percentage,
        total_wagered=total_wagered,
        total_winnings=total_winnings,
        net_profit=net_profit,
        roi_percentage=roi_percentage,
    )


@router.get("/analytics", response_model=BettingAnalytics)
def get_betting_analytics(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get comprehensive betting analytics for charts and visualizations.
    """
    user_bets = db.query(models.Bet).filter(
        models.Bet.user_id == current_user.id
    ).order_by(models.Bet.placed_at.asc()).all()
    
    # Daily profit calculation
    daily_profits = defaultdict(float)
    cumulative_profit = 0
    
    for bet in user_bets:
        date_str = bet.placed_at.strftime('%Y-%m-%d')
        if bet.status == models.BetStatus.WON:
            profit = (bet.potential_payout or 0) - bet.amount
        elif bet.status == models.BetStatus.LOST:
            profit = -bet.amount
        else:
            profit = 0
        
        daily_profits[date_str] += profit
        cumulative_profit += profit
    
    daily_profit_data = [
        {
            "date": date,
            "profit": profit,
            "cumulative_profit": sum(daily_profits[d] for d in sorted(daily_profits.keys()) if d <= date)
        }
        for date, profit in sorted(daily_profits.items())
    ]
    
    # Monthly performance
    monthly_data = defaultdict(lambda: {"bets": 0, "wins": 0, "profit": 0})
    for bet in user_bets:
        month_key = bet.placed_at.strftime('%Y-%m')
        monthly_data[month_key]["bets"] += 1
        if bet.status == models.BetStatus.WON:
            monthly_data[month_key]["wins"] += 1
            monthly_data[month_key]["profit"] += (bet.potential_payout or 0) - bet.amount
        elif bet.status == models.BetStatus.LOST:
            monthly_data[month_key]["profit"] -= bet.amount
    
    monthly_performance = [
        {
            "month": month,
            "bets": data["bets"],
            "wins": data["wins"],
            "profit": data["profit"],
            "win_rate": (data["wins"] / data["bets"] * 100) if data["bets"] > 0 else 0
        }
        for month, data in sorted(monthly_data.items())
    ]
    
    # Bet type performance
    bet_type_data = defaultdict(lambda: {"count": 0, "wins": 0, "profit": 0})
    for bet in user_bets:
        bet_type_data[bet.bet_type]["count"] += 1
        if bet.status == models.BetStatus.WON:
            bet_type_data[bet.bet_type]["wins"] += 1
            bet_type_data[bet.bet_type]["profit"] += (bet.potential_payout or 0) - bet.amount
        elif bet.status == models.BetStatus.LOST:
            bet_type_data[bet.bet_type]["profit"] -= bet.amount
    
    bet_type_performance = [
        {
            "type": bet_type,
            "count": data["count"],
            "wins": data["wins"],
            "win_rate": (data["wins"] / data["count"] * 100) if data["count"] > 0 else 0,
            "profit": data["profit"]
        }
        for bet_type, data in bet_type_data.items()
    ]
    
    # Recent form (last 10 bets)
    recent_bets = sorted(user_bets, key=lambda x: x.placed_at, reverse=True)[:10]
    recent_form = [
        {
            "bet_id": bet.id,
            "bet_type": bet.bet_type,
            "amount": bet.amount,
            "status": bet.status.value,
            "profit": (bet.potential_payout or 0) - bet.amount if bet.status == models.BetStatus.WON else (-bet.amount if bet.status == models.BetStatus.LOST else 0),
            "date": bet.placed_at.strftime('%Y-%m-%d')
        }
        for bet in recent_bets
    ]
    
    # Win rate trend (by week)
    weekly_data = defaultdict(lambda: {"bets": 0, "wins": 0})
    for bet in user_bets:
        # Get the Monday of the week for this bet
        week_start = bet.placed_at - timedelta(days=bet.placed_at.weekday())
        week_key = week_start.strftime('%Y-%m-%d')
        weekly_data[week_key]["bets"] += 1
        if bet.status == models.BetStatus.WON:
            weekly_data[week_key]["wins"] += 1
    
    win_rate_trend = [
        {
            "period": week,
            "win_rate": (data["wins"] / data["bets"] * 100) if data["bets"] > 0 else 0,
            "bets": data["bets"]
        }
        for week, data in sorted(weekly_data.items())
    ]
    
    return BettingAnalytics(
        daily_profit=daily_profit_data,
        monthly_performance=monthly_performance,
        bet_type_performance=bet_type_performance,
        recent_form=recent_form,
        win_rate_trend=win_rate_trend,
    ) 