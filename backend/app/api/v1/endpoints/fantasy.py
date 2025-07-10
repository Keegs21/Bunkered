from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc

from app.api import deps
from app.database.database import get_db
from app.database import models
from app.schemas import fantasy as fantasy_schemas

router = APIRouter()


# ============ LEAGUE MANAGEMENT ============

@router.post("/leagues", response_model=fantasy_schemas.FantasyLeagueResponse)
def create_fantasy_league(
    *,
    db: Session = Depends(get_db),
    league_data: fantasy_schemas.FantasyLeagueCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Create a new fantasy league for the season"""
    db_league = models.FantasyLeague(
        name=league_data.name,
        season_year=league_data.season_year,
        description=league_data.description,
        entry_fee=league_data.entry_fee,
        max_members=league_data.max_members,
        created_by=current_user.id,
        win_points=league_data.win_points,
        top_5_bonus=league_data.top_5_bonus,
        top_10_bonus=league_data.top_10_bonus,
        made_cut_bonus=league_data.made_cut_bonus,
        odds_multiplier=league_data.odds_multiplier,
    )
    db.add(db_league)
    db.commit()
    db.refresh(db_league)
    return db_league


@router.get("/leagues", response_model=List[fantasy_schemas.FantasyLeagueResponse])
def get_fantasy_leagues(
    skip: int = 0,
    limit: int = 100,
    season_year: Optional[int] = None,
    db: Session = Depends(get_db),
) -> Any:
    """Get fantasy leagues"""
    query = db.query(models.FantasyLeague)
    if season_year:
        query = query.filter(models.FantasyLeague.season_year == season_year)
    leagues = query.offset(skip).limit(limit).all()
    return leagues


@router.post("/leagues/{league_id}/join", response_model=dict)
def join_fantasy_league(
    league_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Join a fantasy league"""
    # Check if league exists
    league = db.query(models.FantasyLeague).filter(
        models.FantasyLeague.id == league_id
    ).first()
    if not league:
        raise HTTPException(status_code=404, detail="Fantasy league not found")
    
    # Check if user is already a member
    existing_membership = db.query(models.LeagueMembership).filter(
        and_(models.LeagueMembership.league_id == league_id,
             models.LeagueMembership.user_id == current_user.id)
    ).first()
    if existing_membership:
        raise HTTPException(status_code=400, detail="Already a member of this league")
    
    # Check max members limit
    if league.max_members:
        current_members = db.query(models.LeagueMembership).filter(
            models.LeagueMembership.league_id == league_id
        ).count()
        if current_members >= league.max_members:
            raise HTTPException(status_code=400, detail="League is full")
    
    # Create membership
    membership = models.LeagueMembership(
        league_id=league_id,
        user_id=current_user.id
    )
    db.add(membership)
    db.commit()
    return {"message": "Successfully joined league"}


@router.get("/leagues/{league_id}/leaderboard", response_model=List[fantasy_schemas.LeaderboardEntryResponse])
def get_league_leaderboard(
    league_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Get fantasy league leaderboard with team names"""
    # Query memberships with user info and their corresponding fantasy team
    memberships = db.query(models.LeagueMembership).filter(
        models.LeagueMembership.league_id == league_id
    ).options(
        joinedload(models.LeagueMembership.user)
    ).order_by(desc(models.LeagueMembership.total_points)).all()
    
    # Build leaderboard entries with team names
    leaderboard_entries = []
    for membership in memberships:
        # Find the fantasy team for this user in this league
        fantasy_team = db.query(models.FantasyTeam).filter(
            and_(models.FantasyTeam.user_id == membership.user_id,
                 models.FantasyTeam.league_id == league_id)
        ).first()
        
        # Create leaderboard entry with team name
        entry_data = {
            "id": membership.id,
            "user_id": membership.user_id,
            "league_id": membership.league_id,
            "total_points": membership.total_points,
            "position": membership.position,
            "joined_at": membership.joined_at,
            "team_name": fantasy_team.team_name if fantasy_team else None,
            "username": membership.user.username if membership.user else None,
        }
        leaderboard_entries.append(fantasy_schemas.LeaderboardEntryResponse(**entry_data))
    
    return leaderboard_entries


# ============ TEAM MANAGEMENT ============

@router.post("/teams", response_model=fantasy_schemas.FantasyTeamResponse)
def register_fantasy_team(
    *,
    db: Session = Depends(get_db),
    team_data: fantasy_schemas.FantasyTeamCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Register your team for a league (one-time action)"""
    # Check if league exists
    league = db.query(models.FantasyLeague).filter(
        models.FantasyLeague.id == team_data.league_id
    ).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Check if user is a member of this league
    membership = db.query(models.LeagueMembership).filter(
        and_(models.LeagueMembership.league_id == team_data.league_id,
             models.LeagueMembership.user_id == current_user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=400, detail="Must join league before registering a team")
    
    # Check if team already exists for this league
    existing_team = db.query(models.FantasyTeam).filter(
        and_(models.FantasyTeam.user_id == current_user.id,
             models.FantasyTeam.league_id == team_data.league_id)
    ).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="Team already registered for this league")
    
    # Create team
    db_team = models.FantasyTeam(
        user_id=current_user.id,
        league_id=team_data.league_id,
        team_name=team_data.team_name or f"{current_user.username}'s Team"
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.get("/teams", response_model=List[fantasy_schemas.FantasyTeamResponse])
def get_my_teams(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all my fantasy teams across all leagues"""
    teams = db.query(models.FantasyTeam).filter(
        models.FantasyTeam.user_id == current_user.id
    ).all()
    return teams


# ============ WEEKLY LINEUPS ============

@router.post("/teams/{team_id}/lineups", response_model=fantasy_schemas.WeeklyLineupResponse)
def set_weekly_lineup(
    team_id: int,
    lineup: fantasy_schemas.WeeklyLineupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Set your 3-golfer lineup for a specific tournament"""
    # Verify team ownership
    team = db.query(models.FantasyTeam).filter(
        and_(models.FantasyTeam.id == team_id,
             models.FantasyTeam.user_id == current_user.id)
    ).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found or not owned by you")
    
    # Check if tournament exists
    tournament = db.query(models.Tournament).filter(
        models.Tournament.id == lineup.tournament_id
    ).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Verify all players exist
    players = db.query(models.Player).filter(
        models.Player.id.in_(lineup.player_ids)
    ).all()
    if len(players) != 3:
        raise HTTPException(status_code=400, detail="All selected players must exist")
    
    # Use the live odds provided from frontend at time of submission
    player_odds = {
        lineup.player_ids[0]: lineup.player_odds[0],
        lineup.player_ids[1]: lineup.player_odds[1],
        lineup.player_ids[2]: lineup.player_odds[2]
    }
    
    # Check if lineup already exists for this tournament
    existing_lineup = db.query(models.WeeklyLineup).filter(
        and_(models.WeeklyLineup.team_id == team_id,
             models.WeeklyLineup.tournament_id == lineup.tournament_id)
    ).first()
    
    if existing_lineup:
        if existing_lineup.is_locked:
            raise HTTPException(status_code=400, detail="Lineup is locked (tournament has started)")
        
        # Update existing lineup
        existing_lineup.player_1_id = lineup.player_ids[0]
        existing_lineup.player_2_id = lineup.player_ids[1]
        existing_lineup.player_3_id = lineup.player_ids[2]
        existing_lineup.player_1_odds = player_odds[lineup.player_ids[0]]
        existing_lineup.player_2_odds = player_odds[lineup.player_ids[1]]
        existing_lineup.player_3_odds = player_odds[lineup.player_ids[2]]
        
        db.commit()
        db.refresh(existing_lineup)
        return existing_lineup
    else:
        # Create new lineup
        db_lineup = models.WeeklyLineup(
            team_id=team_id,
            tournament_id=lineup.tournament_id,
            player_1_id=lineup.player_ids[0],
            player_2_id=lineup.player_ids[1],
            player_3_id=lineup.player_ids[2],
            player_1_odds=player_odds[lineup.player_ids[0]],
            player_2_odds=player_odds[lineup.player_ids[1]],
            player_3_odds=player_odds[lineup.player_ids[2]]
        )
        db.add(db_lineup)
        db.commit()
        db.refresh(db_lineup)
        return db_lineup


@router.get("/teams/{team_id}/lineups", response_model=List[fantasy_schemas.WeeklyLineupResponse])
def get_team_lineups(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Get all weekly lineups for a team with detailed tournament and player info"""
    # Verify team ownership
    team = db.query(models.FantasyTeam).filter(
        and_(models.FantasyTeam.id == team_id,
             models.FantasyTeam.user_id == current_user.id)
    ).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found or not owned by you")
    
    # Query with eager loading of relationships
    lineups = db.query(models.WeeklyLineup).options(
        joinedload(models.WeeklyLineup.tournament),
        joinedload(models.WeeklyLineup.player_1),
        joinedload(models.WeeklyLineup.player_2),
        joinedload(models.WeeklyLineup.player_3)
    ).filter(
        models.WeeklyLineup.team_id == team_id
    ).order_by(desc(models.WeeklyLineup.created_at)).all()
    
    return lineups


@router.get("/tournaments/{tournament_id}/lineups", response_model=List[fantasy_schemas.WeeklyLineupResponse])
def get_tournament_lineups(
    tournament_id: int,
    league_id: Optional[int] = None,
    db: Session = Depends(get_db)
) -> Any:
    """Get all lineups for a specific tournament (optionally filtered by league)"""
    query = db.query(models.WeeklyLineup).filter(
        models.WeeklyLineup.tournament_id == tournament_id
    )
    
    if league_id:
        query = query.join(models.FantasyTeam).filter(
            models.FantasyTeam.league_id == league_id
        )
    
    lineups = query.order_by(desc(models.WeeklyLineup.total_points)).all()
    return lineups


# ============ SIMPLE SCORING EXAMPLES ============

@router.get("/scoring-examples", response_model=dict)
def get_scoring_examples() -> Any:
    """Return example scoring scenarios"""
    return {
        "description": "Fantasy golf scoring system",
        "formula": "(Position Points + Bonus Points) × Odds Multiplier",
        "examples": [
            {
                "scenario": "Tournament winner with 8/1 odds",
                "position": 1,
                "odds": "8/1",
                "estimated_points": "~424 points"
            },
            {
                "scenario": "Tournament winner with 80/1 odds", 
                "position": 1,
                "odds": "80/1",
                "estimated_points": "~610 points"
            },
            {
                "scenario": "3rd place with 25/1 odds",
                "position": 3,
                "odds": "25/1", 
                "estimated_points": "~186 points"
            },
            {
                "scenario": "Made cut, 45th place with 150/1 odds",
                "position": 45,
                "odds": "150/1",
                "estimated_points": "~48 points"
            },
            {
                "scenario": "Missed cut",
                "position": "MC",
                "odds": "Any",
                "estimated_points": "0 points"
            }
        ]
    } 