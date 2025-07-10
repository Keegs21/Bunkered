from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.database.database import get_db
from app.database import models
from app.services.datagolf_service import datagolf_service

router = APIRouter()


def serialize_player(player):
    """Helper function to serialize a player model to dict"""
    return {
        "id": player.id,
        "name": player.name,
        "datagolf_player_id": player.datagolf_player_id,
        "country": player.country,
        "world_ranking": player.world_ranking,
        "created_at": getattr(player.created_at, 'isoformat', lambda: None)() if hasattr(player, 'created_at') and player.created_at else None,
        "updated_at": getattr(player.updated_at, 'isoformat', lambda: None)() if hasattr(player, 'updated_at') and player.updated_at else None
    }


def serialize_player_stats(stat):
    """Helper function to serialize player stats to dict"""
    return {
        "id": stat.id,
        "player_id": stat.player_id,
        "year": stat.year,
        "tournament_id": stat.tournament_id,
        "rounds_played": stat.rounds_played,
        "scoring_average": stat.scoring_average,
        "strokes_gained_total": stat.strokes_gained_total,
        "strokes_gained_ott": stat.strokes_gained_ott,
        "strokes_gained_app": stat.strokes_gained_app,
        "strokes_gained_arg": stat.strokes_gained_arg,
        "strokes_gained_putt": stat.strokes_gained_putt,
        "created_at": getattr(stat.created_at, 'isoformat', lambda: None)() if hasattr(stat, 'created_at') and stat.created_at else None,
        "updated_at": getattr(stat.updated_at, 'isoformat', lambda: None)() if hasattr(stat, 'updated_at') and stat.updated_at else None
    }


@router.get("/", response_model=List[dict])
def read_players(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve players.
    """
    players = db.query(models.Player).offset(skip).limit(limit).all()
    return [serialize_player(player) for player in players]


@router.get("/{player_id}", response_model=dict)
def read_player(
    player_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get player by ID.
    """
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return serialize_player(player)


@router.get("/{player_id}/stats", response_model=List[dict])
def get_player_stats(
    player_id: int,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get player statistics.
    """
    query = db.query(models.PlayerStats).filter(models.PlayerStats.player_id == player_id)
    if year:
        query = query.filter(models.PlayerStats.year == year)
    
    stats = query.all()
    return [serialize_player_stats(stat) for stat in stats]


@router.get("/datagolf/list", response_model=List[dict])
async def get_datagolf_player_list() -> Any:
    """
    Get list of all players from DataGolf API.
    """
    try:
        players = await datagolf_service.get_player_list()
        return players
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching player list: {str(e)}")


@router.get("/datagolf/rankings", response_model=List[dict])
async def get_datagolf_rankings() -> Any:
    """
    Get current Data Golf rankings.
    """
    try:
        rankings = await datagolf_service.get_dg_rankings()
        return rankings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rankings: {str(e)}")


@router.get("/datagolf/with-rankings", response_model=List[dict])
async def get_players_with_rankings() -> Any:
    """
    Get players with their current rankings merged.
    """
    try:
        players = await datagolf_service.get_players_with_rankings()
        return players
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching players with rankings: {str(e)}")


@router.get("/datagolf/skill-ratings", response_model=List[dict])
async def get_skill_ratings(
    display: str = Query("value", description="Display format (value or rank)"),
) -> Any:
    """
    Get player skill ratings from DataGolf.
    """
    try:
        ratings = await datagolf_service.get_skill_ratings(display=display)
        return ratings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching skill ratings: {str(e)}")


@router.get("/datagolf/decompositions", response_model=List[dict])
async def get_player_decompositions(
    tour: str = Query("pga", description="Tour to get decompositions for (pga, euro, opp, alt)"),
) -> Any:
    """
    Get detailed breakdown of every player's strokes-gained prediction for upcoming tournaments.
    """
    try:
        decompositions = await datagolf_service.get_player_decompositions(tour=tour)
        return decompositions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching player decompositions: {str(e)}")


@router.get("/datagolf/approach-skill", response_model=List[dict])
async def get_approach_skill(
    period: str = Query("l24", description="Time period (l24=last 24 months, l12=last 12 months, ytd=year to date)"),
) -> Any:
    """
    Get detailed player-level approach performance stats across various yardage/lie buckets.
    """
    try:
        approach_skill = await datagolf_service.get_approach_skill(period=period)
        return approach_skill
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching approach skill: {str(e)}")


@router.get("/search", response_model=List[dict])
def search_players(
    name: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Search players by name.
    """
    players = db.query(models.Player).filter(
        models.Player.name.ilike(f"%{name}%")
    ).limit(50).all()
    return [serialize_player(player) for player in players] 