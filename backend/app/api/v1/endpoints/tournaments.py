from typing import Any, List, Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.database.database import get_db
from app.database import models
from app.services.datagolf_service import datagolf_service
from app.services.fanduel_service import fanduel_service

logger = logging.getLogger(__name__)
router = APIRouter()


def serialize_tournament(tournament):
    """Helper function to serialize a tournament model to dict"""
    return {
        "id": tournament.id,
        "name": tournament.name,
        "year": tournament.year,
        "start_date": getattr(tournament.start_date, 'isoformat', lambda: None)() if hasattr(tournament, 'start_date') and tournament.start_date else None,
        "end_date": getattr(tournament.end_date, 'isoformat', lambda: None)() if hasattr(tournament, 'end_date') and tournament.end_date else None,
        "course_name": tournament.course_name,
        "purse": tournament.purse,
        "datagolf_tournament_id": tournament.datagolf_tournament_id,
        "is_active": tournament.is_active,
        "is_completed": tournament.is_completed,
        "created_at": getattr(tournament.created_at, 'isoformat', lambda: None)() if hasattr(tournament, 'created_at') and tournament.created_at else None,
        "updated_at": getattr(tournament.updated_at, 'isoformat', lambda: None)() if hasattr(tournament, 'updated_at') and tournament.updated_at else None
    }


@router.get("/", response_model=List[dict])
def read_tournaments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve tournaments.
    """
    tournaments = db.query(models.Tournament).offset(skip).limit(limit).all()
    return [serialize_tournament(tournament) for tournament in tournaments]


@router.get("/{tournament_id}", response_model=dict)
def read_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get tournament by ID.
    """
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return serialize_tournament(tournament)


@router.get("/{tournament_id}/leaderboard", response_model=List[dict])
def get_tournament_leaderboard(
    tournament_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get tournament leaderboard.
    """
    # This would integrate with DataGolf API
    # For now, return placeholder data
    return [
        {
            "position": 1,
            "player_name": "Example Player",
            "score": -15,
            "thru": "F"
        }
    ]


@router.get("/datagolf/recent", response_model=List[dict])
async def get_recent_tournaments_from_datagolf(
    tour: str = Query("pga", description="Tour to get tournaments from (pga, euro, kft, etc.)"),
    limit: int = Query(20, description="Number of tournaments to return", ge=1, le=50),
) -> Any:
    """
    Get recent tournaments from DataGolf API.
    """
    try:
        tournaments = await datagolf_service.get_recent_tournaments(tour=tour, limit=limit)
        return tournaments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tournaments: {str(e)}")


@router.get("/datagolf/schedule", response_model=dict)
async def get_tournament_schedule(
    tour: str = Query("all", description="Tour schedule to get (all, pga, euro, kft, etc.)"),
) -> Any:
    """
    Get tournament schedule from DataGolf API.
    """
    try:
        schedule = await datagolf_service.get_schedule(tour=tour)
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schedule: {str(e)}")


@router.get("/datagolf/{tour}/{event_id}/{year}/leaderboard", response_model=List[dict])
async def get_datagolf_tournament_leaderboard(
    tour: str,
    event_id: str,
    year: int,
) -> Any:
    """
    Get tournament leaderboard from DataGolf API.
    For live tournaments, uses live tournament stats.
    For completed tournaments, uses historical data.
    """
    try:
        logger.info(f"🏆 Leaderboard request: {tour}/{event_id}/{year}")
        
        # First check if this is a live tournament by getting the schedule
        schedule = await datagolf_service.get_schedule(tour=tour)
        is_live_tournament = False
        tournament_info = None
        
        logger.info(f"🏆 Schedule response type: {type(schedule)}")
        if schedule and 'schedule' in schedule:
            logger.info(f"🏆 Found {len(schedule['schedule'])} tournaments in schedule")
            
            from datetime import datetime
            current_date = datetime.now()
            logger.info(f"🏆 Current date: {current_date}")
            
            for tournament in schedule['schedule']:
                logger.info(f"🏆 Checking tournament: event_id={tournament.get('event_id')}, name={tournament.get('event_name')}")
                
                if str(tournament.get('event_id')) == str(event_id):
                    logger.info(f"🏆 Found matching tournament: {tournament.get('event_name')}")
                    tournament_info = tournament
                    start_date = tournament.get('start_date')
                    end_date = tournament.get('end_date')
                    
                    logger.info(f"🏆 Tournament dates: start={start_date}, end={end_date}")
                    
                    if start_date:
                        try:
                            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                            
                            # If no end date, estimate it (golf tournaments are typically 4 days)
                            if end_date:
                                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                            else:
                                from datetime import timedelta
                                end_dt = start_dt + timedelta(days=3)  # Assume 4-day tournament
                                logger.info(f"🏆 Estimated end date: {end_dt}")
                            
                            # Check if tournament is currently happening
                            if start_dt <= current_date <= end_dt:
                                is_live_tournament = True
                                logger.info(f"🏆 Tournament IS LIVE: {start_dt} <= {current_date} <= {end_dt}")
                                break
                            else:
                                logger.info(f"🏆 Tournament NOT LIVE: {start_dt} <= {current_date} <= {end_dt}")
                        except ValueError as e:
                            logger.error(f"🏆 Date parsing error: {e}")
                            continue
                    else:
                        logger.warning(f"🏆 No start date for tournament {event_id}")
        else:
            logger.warning(f"🏆 No schedule data available or invalid format")
        
        if is_live_tournament:
            # Use live tournament stats for ongoing tournaments
            logger.info(f"🏆 Using LIVE tournament stats for {tour}/{event_id}/{year}")
            leaderboard = await datagolf_service.get_live_tournament_leaderboard(tour=tour)
            logger.info(f"🏆 Live tournament stats returned {len(leaderboard) if leaderboard else 0} entries")
            
            # If we got live data, sort by score (total field) to create leaderboard
            if leaderboard and len(leaderboard) > 0 and not any(entry.get('error') for entry in leaderboard):
                # Sort by total score (lower is better in golf)
                leaderboard.sort(key=lambda x: x.get('total_score', 999) if x.get('total_score') is not None else 999)
                
                # Add positions based on sorted order
                for i, entry in enumerate(leaderboard):
                    if not entry.get('position'):
                        entry['position'] = i + 1
                
                logger.info(f"🏆 Sorted live leaderboard with {len(leaderboard)} players")
                if leaderboard:
                    logger.info(f"🏆 Leader: {leaderboard[0].get('player_name')} at {leaderboard[0].get('total_score')}")
        else:
            # Use historical data for completed tournaments
            logger.info(f"🏆 Using HISTORICAL data for {tour}/{event_id}/{year}")
            leaderboard = await datagolf_service.get_tournament_leaderboard(tour=tour, event_id=event_id, year=year)
            logger.info(f"🏆 Historical leaderboard returned {len(leaderboard) if leaderboard else 0} entries")
        
        return leaderboard
    except Exception as e:
        logger.error(f"🏆 Error fetching leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")


@router.get("/datagolf/live/predictions", response_model=dict)
async def get_live_predictions(
    tour: str = Query("pga", description="Tour for live predictions"),
    odds_format: str = Query("percent", description="Odds format (percent, american, decimal)"),
) -> Any:
    """
    Get live predictions for ongoing tournaments.
    """
    try:
        predictions = await datagolf_service.get_live_predictions(tour=tour, odds_format=odds_format)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live predictions: {str(e)}")


@router.get("/datagolf/live/stats", response_model=dict)
async def get_live_tournament_stats(
    stats: str = Query("sg_total,sg_ott,sg_app,sg_arg,sg_putt", description="Comma-separated list of stats"),
    round_type: str = Query("event_cumulative", description="Round type"),
    display: str = Query("value", description="Display format (value or rank)"),
) -> Any:
    """
    Get live tournament statistics.
    """
    try:
        live_stats = await datagolf_service.get_live_tournament_stats(
            stats=stats, round_type=round_type, display=display
        )
        return live_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live stats: {str(e)}")


@router.get("/datagolf/live/hole-stats", response_model=dict)
async def get_live_hole_stats(
    tour: str = Query("pga", description="Tour for live hole statistics"),
) -> Any:
    """
    Get live hole scoring distributions broken down by tee time wave.
    """
    try:
        hole_stats = await datagolf_service.get_live_hole_stats(tour=tour)
        return hole_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live hole stats: {str(e)}")


@router.get("/datagolf/test", response_model=dict)
async def test_datagolf_connection() -> Any:
    """
    Test DataGolf API connection.
    """
    try:
        # Just test basic connectivity by getting player list with limit
        test_data = await datagolf_service.get_player_list()
        return {
            "status": "success",
            "message": "DataGolf API connection successful",
            "sample_data_length": len(test_data) if test_data else 0,
            "api_configured": datagolf_service.api_key is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DataGolf API test failed: {str(e)}")


@router.get("/datagolf/debug/events", response_model=List[dict])
async def debug_historical_events() -> Any:
    """
    Debug endpoint to see historical events structure.
    """
    try:
        events = await datagolf_service.get_historical_event_list()
        # Return first 10 events to see structure
        return events[:10] if events else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical events: {str(e)}")


@router.get("/datagolf/debug/schedule", response_model=dict)
async def debug_schedule() -> Any:
    """
    Debug endpoint to see schedule structure.
    """
    try:
        schedule = await datagolf_service.get_schedule(tour="pga")
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schedule: {str(e)}")


@router.get("/datagolf/debug/2024-events", response_model=List[dict])
async def debug_2024_events() -> Any:
    """
    Debug endpoint to see 2024 events.
    """
    try:
        events = await datagolf_service.get_historical_event_list()
        # Filter for 2024 PGA events
        events_2024 = [e for e in events if e.get('calendar_year') == 2024 and e.get('tour') == 'pga']
        return events_2024[:10] if events_2024 else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching 2024 events: {str(e)}")


@router.get("/datagolf/debug/raw-data/{tour}/{event_id}/{year}", response_model=List[dict])
async def debug_raw_tournament_data(
    tour: str,
    event_id: str,
    year: int,
) -> Any:
    """
    Debug endpoint to see raw tournament data structure.
    """
    try:
        raw_data = await datagolf_service.get_historical_tournament_data(tour, event_id, year)
        # Return first 5 records to see structure
        return raw_data[:5] if raw_data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching raw tournament data: {str(e)}")


@router.get("/datagolf/debug/historical-raw/{tour}/{event_id}/{year}", response_model=List[dict])
async def debug_historical_raw_data(
    tour: str,
    event_id: str,
    year: int,
) -> Any:
    """
    Debug endpoint to test historical data method directly.
    """
    try:
        raw_data = await datagolf_service.get_historical_tournament_data(tour, event_id, year)
        return raw_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/datagolf/historical-odds/events", response_model=List[dict])
async def get_historical_odds_events(
    tour: str = Query("pga", description="Tour to get odds events for"),
) -> Any:
    """
    Get list of tournaments available for historical odds data.
    """
    try:
        events = await datagolf_service.get_historical_odds_event_list(tour=tour)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical odds events: {str(e)}")


@router.get("/datagolf/historical-odds/{tour}/{event_id}/{year}", response_model=List[dict])
async def get_historical_tournament_odds(
    tour: str,
    event_id: str,
    year: int,
    market: str = Query("win", description="Market type (win, top_5, top_10, top_20, make_cut)"),
    book: str = Query("pinnacle", description="Sportsbook (pinnacle, draftkings, fanduel, etc.)"),
    odds_format: str = Query("decimal", description="Odds format (decimal, american, percent)"),
) -> Any:
    """
    Get historical betting odds for a specific tournament.
    """
    try:
        odds = await datagolf_service.get_historical_outright_odds(
            tour=tour,
            event_id=event_id,
            year=year,
            market=market,
            book=book,
            odds_format=odds_format
        )
        return odds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical odds: {str(e)}")


@router.get("/datagolf/rankings", response_model=List[dict])
async def get_player_rankings() -> Any:
    """
    Get DataGolf player rankings for lineup selection.
    """
    try:
        rankings = await datagolf_service.get_dg_rankings()
        return rankings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching player rankings: {str(e)}")


@router.get("/datagolf/pre-tournament-predictions", response_model=dict)
async def get_pre_tournament_predictions(
    tour: str = Query("pga", description="Tour to get predictions for"),
    odds_format: str = Query("decimal", description="Odds format (decimal, american, percent)"),
) -> Any:
    """
    Get pre-tournament predictions including odds for upcoming tournaments.
    """
    try:
        predictions = await datagolf_service.get_pre_tournament_predictions(
            tour=tour, 
            odds_format=odds_format
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pre-tournament predictions: {str(e)}")


@router.get("/fanduel/tournament-odds/{event_id}", response_model=dict)
async def get_tournament_fanduel_odds(
    event_id: str,
    tour: str = Query("pga", description="Tour name"),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get FanDuel-style odds for tournament players with fantasy points projections.
    Auto-syncs tournament and player data to local database.
    """
    try:
        from app.services.sync_service import SyncService
        
        # First, sync tournament and player data to local database
        sync_service = SyncService(db)
        local_tournament = await sync_service.sync_tournament_with_players(event_id, tour)
        
        # Get FanDuel odds data
        odds_data = await fanduel_service.get_tournament_odds(
            tournament_event_id=event_id,
            tour=tour
        )
        
        # Add local database IDs to the response for frontend use
        if local_tournament and odds_data.get("player_odds"):
            # Get local player mappings
            player_datagolf_ids = [str(p.get("dg_id")) for p in odds_data["player_odds"] if p.get("dg_id")]
            local_players = sync_service.get_local_players_by_datagolf_ids(player_datagolf_ids)
            
            # Create mapping from DataGolf ID to local ID
            datagolf_to_local = {}  # type: ignore
            for p in local_players:
                datagolf_to_local[p.datagolf_player_id] = p.id  # type: ignore
            
            # Add local IDs to player odds
            for player_odds in odds_data["player_odds"]:
                dg_id = str(player_odds.get("dg_id", ""))
                if dg_id in datagolf_to_local:
                    player_odds["local_player_id"] = datagolf_to_local[dg_id]
                    player_odds["local_tournament_id"] = local_tournament.id
        
        return odds_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching FanDuel odds: {str(e)}")


@router.get("/datagolf/debug/leaderboard-with-odds/{tour}/{event_id}/{year}", response_model=List[dict])
async def debug_leaderboard_with_odds(
    tour: str,
    event_id: str,
    year: int,
) -> Any:
    """
    Debug endpoint to test leaderboard with odds integration.
    """
    try:
        leaderboard = await datagolf_service.get_tournament_leaderboard(tour, event_id, year)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard with odds: {str(e)}") 