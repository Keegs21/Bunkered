import httpx
import asyncio
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class DataGolfService:
    """Service for integrating with DataGolf API"""
    
    def __init__(self):
        self.base_url = settings.DATAGOLF_BASE_URL
        self.api_key = settings.DATAGOLF_API_KEY
        
        if not self.api_key:
            logger.warning("DataGolf API key not configured")
    
    async def _make_request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Union[Dict[str, Any], List[Any]]:
        """Make an HTTP request to DataGolf API"""
        if not self.api_key:
            raise ValueError("DataGolf API key not configured")
        
        if params is None:
            params = {}
        params['key'] = self.api_key
        
        url = f"{self.base_url}/{endpoint}"
        
        # Create readable params string for logging (hide full API key)
        log_params = {k: v for k, v in params.items()}
        if 'key' in log_params:
            log_params['key'] = f"{self.api_key[:10]}..."
        
        params_str = "&".join([f"{k}={v}" for k, v in log_params.items()])
        full_url = f"{url}?{params_str}"
        
        print(f"🔵 DataGolf API Call: {full_url}")
        logger.info(f"DataGolf API Call: {full_url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, params=params)
                
                print(f"🔵 DataGolf Response: {response.status_code}")
                logger.info(f"DataGolf Response: {response.status_code}")
                
                response.raise_for_status()
                
                # Get raw response text first
                raw_response_text = response.text
                print(f"🔵 RAW DataGolf Response (first 500 chars): {raw_response_text[:500]}")
                
                data = response.json()
                print(f"🔵 Parsed JSON Type: {type(data)}")
                
                if isinstance(data, list):
                    print(f"🔵 DataGolf Data: List with {len(data)} items")
                    if len(data) > 0:
                        print(f"🔵 First item: {data[0]}")
                elif isinstance(data, dict):
                    print(f"🔵 DataGolf Data: Dict with keys: {list(data.keys())}")
                    # Print actual values for key fields
                    for key, value in data.items():
                        if isinstance(value, (list, dict)):
                            print(f"🔵   {key}: {type(value)} with {len(value) if hasattr(value, '__len__') else 'N/A'} items")
                        else:
                            print(f"🔵   {key}: {value}")
                else:
                    print(f"🔵 DataGolf Data: {type(data)}")
                    
                return data
                    
            except httpx.HTTPStatusError as e:
                error_text = e.response.text
                print(f"🔴 DataGolf API Error: {e.response.status_code} - {error_text}")
                print(f"🔴 Failed URL: {full_url}")
                logger.error(f"DataGolf API error: {e.response.status_code} - {error_text}")
                logger.error(f"Failed URL: {full_url}")
                raise
            except Exception as e:
                print(f"🔴 DataGolf API Exception: {str(e)}")
                print(f"🔴 Failed URL: {full_url}")
                logger.error(f"DataGolf API request failed: {str(e)}")
                logger.error(f"Failed URL: {full_url}")
                raise

    # ================== GENERAL DATA ==================
    
    async def get_player_list(self, file_format: str = "json") -> List[Dict[str, Any]]:
        """Get list of all players with IDs. Returns a list directly."""
        response = await self._make_request("get-player-list", {"file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Look for common field names that might contain the player list
            players_data = response.get('players', response.get('player_list', []))
            print(f"🔵 Extracted players data: {type(players_data)} with {len(players_data)} items")
            return players_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected player list response type: {type(response)}")
            return []
    
    async def get_schedule(self, tour: str = "all", file_format: str = "json") -> Dict[str, Any]:
        """Get tournament schedules for tours"""
        response = await self._make_request("get-schedule", {"tour": tour, "file_format": file_format})
        if isinstance(response, dict):
            return response
        return {"schedule": response if isinstance(response, list) else []}
    
    async def get_field_updates(self, tour: str = "pga", file_format: str = "json") -> Dict[str, Any]:
        """Get field updates including WDs, tee times, etc."""
        response = await self._make_request("field-updates", {"tour": tour, "file_format": file_format})
        if isinstance(response, dict):
            return response
        return {"field_updates": response if isinstance(response, list) else []}

    # ================== RANKINGS & PREDICTIONS ==================
    
    async def get_dg_rankings(self, file_format: str = "json") -> List[Dict[str, Any]]:
        """Get Data Golf rankings (top 500 players). Returns a list directly."""
        response = await self._make_request("preds/get-dg-rankings", {"file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Extract rankings data from dict structure
            rankings_data = response.get('rankings', [])
            print(f"🔵 Extracted rankings data: {type(rankings_data)} with {len(rankings_data)} items")
            if rankings_data and len(rankings_data) > 0:
                print(f"🔵 First ranking item: {rankings_data[0]}")
            return rankings_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected rankings response type: {type(response)}")
            return []
    
    async def get_pre_tournament_predictions(self, 
                                           tour: str = "pga", 
                                           add_position: str = "",
                                           odds_format: str = "percent",
                                           file_format: str = "json") -> Dict[str, Any]:
        """Get pre-tournament predictions for upcoming tournaments"""
        params = {
            "tour": tour,
            "odds_format": odds_format,
            "file_format": file_format
        }
        if add_position:
            params["add_position"] = add_position
        
        response = await self._make_request("preds/pre-tournament", params)
        if isinstance(response, dict):
            return response
        return {"predictions": response if isinstance(response, list) else []}
    
    async def get_skill_ratings(self, display: str = "value", file_format: str = "json") -> List[Dict[str, Any]]:
        """Get player skill ratings. Returns a list directly."""
        response = await self._make_request("preds/skill-ratings", {"display": display, "file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Look for skill ratings data - the API returns data in the 'players' key
            skill_data = response.get('players', [])
            print(f"🔵 Extracted skill ratings data: {type(skill_data)} with {len(skill_data)} items")
            if skill_data and len(skill_data) > 0:
                print(f"🔵 First skill rating item: {skill_data[0]}")
            return skill_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected skill ratings response type: {type(response)}")
            return []

    async def get_player_decompositions(self, tour: str = "pga", file_format: str = "json") -> List[Dict[str, Any]]:
        """Get detailed breakdown of every player's strokes-gained prediction for upcoming tournaments. Returns a list directly."""
        response = await self._make_request("preds/player-decompositions", {"tour": tour, "file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Look for decomposition data - the API returns data in the 'players' key
            decomp_data = response.get('players', [])
            print(f"🔵 Extracted decomposition data: {type(decomp_data)} with {len(decomp_data)} items")
            if decomp_data and len(decomp_data) > 0:
                print(f"🔵 First decomposition item: {decomp_data[0]}")
            return decomp_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected decomposition response type: {type(response)}")
            return []

    async def get_approach_skill(self, period: str = "l24", file_format: str = "json") -> List[Dict[str, Any]]:
        """Get detailed player-level approach performance stats across various yardage/lie buckets. Returns a list directly."""
        response = await self._make_request("preds/approach-skill", {"period": period, "file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Look for approach skill data - the API returns data in the 'data' key
            approach_data = response.get('data', [])
            print(f"🔵 Extracted approach skill data: {type(approach_data)} with {len(approach_data)} items")
            if approach_data and len(approach_data) > 0:
                print(f"🔵 First approach skill item: {approach_data[0]}")
            return approach_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected approach skill response type: {type(response)}")
            return []

    # ================== LIVE DATA ==================
    
    async def get_live_predictions(self, 
                                  tour: str = "pga",
                                  odds_format: str = "percent", 
                                  file_format: str = "json") -> Dict[str, Any]:
        """Get live predictions for ongoing tournaments"""
        response = await self._make_request("preds/in-play", {
            "tour": tour,
            "odds_format": odds_format,
            "file_format": file_format
        })
        if isinstance(response, dict):
            return response
        return {"live_predictions": response if isinstance(response, list) else []}
    
    async def get_live_tournament_stats(self, 
                                       stats: str = "sg_total,sg_ott,sg_app,sg_arg,sg_putt",
                                       round_type: str = "event_cumulative",
                                       display: str = "value",
                                       file_format: str = "json") -> Dict[str, Any]:
        """Get live tournament statistics"""
        response = await self._make_request("preds/live-tournament-stats", {
            "stats": stats,
            "round": round_type,
            "display": display,
            "file_format": file_format
        })
        if isinstance(response, dict):
            return response
        return {"live_stats": response if isinstance(response, list) else []}

    async def get_live_hole_stats(self, 
                                  tour: str = "pga",
                                  file_format: str = "json") -> Dict[str, Any]:
        """Get live hole scoring distributions broken down by tee time wave"""
        response = await self._make_request("preds/live-hole-stats", {
            "tour": tour,
            "file_format": file_format
        })
        if isinstance(response, dict):
            return response
        return {"hole_stats": response if isinstance(response, list) else []}

    # ================== HISTORICAL DATA ==================
    
    async def get_historical_event_list(self, file_format: str = "json") -> List[Dict[str, Any]]:
        """Get list of available historical events. Returns a list directly."""
        response = await self._make_request("historical-raw-data/event-list", {"file_format": file_format})
        
        # Handle both dict and list responses
        if isinstance(response, dict):
            # Look for events data
            events_data = response.get('events', response.get('event_list', []))
            print(f"🔵 Extracted events data: {type(events_data)} with {len(events_data)} items")
            return events_data
        elif isinstance(response, list):
            return response
        else:
            print(f"🔵 Unexpected events response type: {type(response)}")
            return []
    
    async def get_historical_tournament_data(self, 
                                           tour: str,
                                           event_id: str,
                                           year: int,
                                           file_format: str = "json") -> List[Dict[str, Any]]:
        """Get historical round-by-round tournament data. Returns a list directly."""
        try:
            logger.info(f"Fetching historical tournament data for tour={tour}, event_id={event_id}, year={year}")
            response = await self._make_request("historical-raw-data/rounds", {
                "tour": tour,
                "event_id": event_id,
                "year": year,
                "file_format": file_format
            })
            logger.info(f"Historical tournament data response type: {type(response)}, length: {len(response) if isinstance(response, list) else 'N/A'}")
            # API returns a list directly
            if isinstance(response, list):
                return response
            return []
        except Exception as e:
            error_msg = str(e)
            if "403" in error_msg and "historical data" in error_msg.lower():
                logger.warning(f"DataGolf subscription doesn't include historical data access. Upgrade required for tournament leaderboards.")
                # Return a structured error response that the frontend can handle
                return [{
                    "error": "subscription_required",
                    "message": "Historical tournament data requires DataGolf 'Scratch Plus' subscription",
                    "upgrade_url": "https://datagolf.com/manage-subscription",
                    "features_missing": ["Round-by-round scoring data", "Tournament leaderboards", "Historical performance"]
                }]
            logger.error(f"Error fetching historical tournament data: {str(e)}")
            return []

    # ================== HISTORICAL BETTING ODDS ==================
    
    async def get_historical_odds_event_list(self, tour: str = "pga", file_format: str = "json") -> List[Dict[str, Any]]:
        """Get list of tournaments available for historical odds data"""
        try:
            response = await self._make_request("historical-odds/event-list", {
                "tour": tour,
                "file_format": file_format
            })
            if isinstance(response, list):
                return response
            return []
        except Exception as e:
            error_msg = str(e)
            if "403" in error_msg and ("historical data" in error_msg.lower() or "odds" in error_msg.lower()):
                logger.warning(f"DataGolf subscription doesn't include historical odds access. Upgrade required.")
                return [{
                    "error": "subscription_required",
                    "message": "Historical betting odds require DataGolf 'Scratch Plus' subscription",
                    "upgrade_url": "https://datagolf.com/manage-subscription"
                }]
            logger.error(f"Error fetching historical odds event list: {str(e)}")
            return []
    
    async def get_historical_outright_odds(self,
                                         tour: str = "pga",
                                         event_id: str = "",
                                         year: int = 2024,
                                         market: str = "win",
                                         book: str = "pinnacle",
                                         odds_format: str = "decimal",
                                         file_format: str = "json") -> List[Dict[str, Any]]:
        """Get historical outright betting odds for tournaments"""
        try:
            logger.info(f"Fetching historical odds for tour={tour}, event_id={event_id}, year={year}, market={market}")
            params = {
                "tour": tour,
                "market": market,
                "book": book,
                "odds_format": odds_format,
                "file_format": file_format
            }
            if event_id:
                params["event_id"] = event_id
            if year:
                params["year"] = str(year)
                
            response = await self._make_request("historical-odds/outrights", params)
            logger.info(f"Historical odds response type: {type(response)}, length: {len(response) if isinstance(response, list) else 'N/A'}")
            
            if isinstance(response, list):
                return response
            return []
        except Exception as e:
            error_msg = str(e)
            if "403" in error_msg and ("historical data" in error_msg.lower() or "odds" in error_msg.lower()):
                logger.warning(f"DataGolf subscription doesn't include historical odds access. Upgrade required for betting data.")
                return [{
                    "error": "subscription_required",
                    "message": "Historical betting odds require DataGolf 'Scratch Plus' subscription",
                    "upgrade_url": "https://datagolf.com/manage-subscription",
                    "features_missing": ["Opening/closing odds", "Historical betting markets", "Outcome tracking"]
                }]
            logger.error(f"Error fetching historical outright odds: {str(e)}")
            return []

    # ================== LIVE BETTING TOOLS ==================
    
    async def get_live_outright_odds(self, 
                                   tour: str = "pga",
                                   book: str = "fanduel",
                                   odds_format: str = "american",
                                   file_format: str = "json") -> List[Dict[str, Any]]:
        """Get live outright betting odds for current/upcoming tournaments"""
        try:
            logger.info(f"Fetching live outright odds for tour={tour}, book={book}")
            params = {
                "tour": tour,
                "market": "win",  # Required parameter for outrights endpoint
                "odds_format": odds_format,
                "file_format": file_format
            }
                
            # Construct the full URL for debugging
            full_url = f"{self.base_url}/betting-tools/outrights"
            url_params = "&".join([f"{k}={v}" for k, v in params.items()])
            full_url_with_params = f"{full_url}?{url_params}&key={self.api_key}"
            
            logger.info(f"====== DATAGOLF URL DEBUG ======")
            logger.info(f"Base URL: {self.base_url}")
            logger.info(f"Endpoint: betting-tools/outrights")
            logger.info(f"Params: {params}")
            logger.info(f"Full URL: {full_url_with_params}")
            logger.info(f"====== MAKING REQUEST ======")
            
            response = await self._make_request("betting-tools/outrights", params)
            
            logger.info(f"====== DATAGOLF RESPONSE ======")
            logger.info(f"Response type: {type(response)}")
            logger.info(f"Response length: {len(response) if isinstance(response, list) else 'N/A'}")
            logger.info(f"Raw response: {response}")
            logger.info(f"====== END RESPONSE ======")
            
            # Handle both dict and list responses
            if isinstance(response, dict):
                # Extract odds data from dict structure
                odds_data = response.get('odds', [])
                print(f"🔵 Extracted odds data: {type(odds_data)} with {len(odds_data)} items")
                if odds_data and len(odds_data) > 0:
                    print(f"🔵 First odds item: {odds_data[0]}")
                return odds_data
            elif isinstance(response, list):
                return response
            else:
                print(f"🔵 Unexpected response type: {type(response)}")
                return []
        except Exception as e:
            error_msg = str(e)
            if "403" in error_msg:
                logger.warning(f"DataGolf subscription doesn't include live betting tools access.")
                return [{
                    "error": "subscription_required",
                    "message": "Live betting odds require DataGolf 'Scratch Plus' subscription",
                    "upgrade_url": "https://datagolf.com/manage-subscription",
                    "features_missing": ["Live FanDuel odds", "Current betting markets", "Real-time odds updates"]
                }]
            logger.error(f"Error fetching live outright odds: {str(e)}")
            return []
    
    async def get_live_matchup_odds(self, 
                                  tour: str = "pga",
                                  book: str = "fanduel",
                                  odds_format: str = "american",
                                  file_format: str = "json") -> List[Dict[str, Any]]:
        """Get live matchup betting odds for current tournaments"""
        try:
            logger.info(f"Fetching live matchup odds for tour={tour}, book={book}")
            params = {
                "tour": tour,
                "market": "tournament_matchups",  # Required parameter for matchups endpoint
                "odds_format": odds_format,
                "file_format": file_format
            }
                
            response = await self._make_request("betting-tools/matchups", params)
            logger.info(f"Live matchup odds response type: {type(response)}, length: {len(response) if isinstance(response, list) else 'N/A'}")
            
            if isinstance(response, list):
                return response
            return []
        except Exception as e:
            logger.error(f"Error fetching live matchup odds: {str(e)}")
            return []

    # ================== CUSTOM METHODS FOR OUR APP ==================
    
    async def get_recent_tournaments(self, tour: str = "pga", limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent completed tournaments"""
        try:
            # Get historical events list
            events_data = await self.get_historical_event_list()
            
            if not events_data:
                return []
            
            # Filter by tour and get events from the past (completed tournaments)
            recent_events = []
            current_date = datetime.now()
            
            for event in events_data:
                # Check if this is the right tour
                if event.get('tour') != tour:
                    continue
                
                # Parse the event date
                event_date_str = event.get('date')
                if not event_date_str:
                    continue
                
                try:
                    event_date = datetime.strptime(event_date_str, '%Y-%m-%d')
                    # Only include events that have already happened (past dates)
                    # Include events from 2024 and recent 2025 events
                    calendar_year = event.get('calendar_year', 0)
                    if event_date < current_date and calendar_year >= 2024:
                        recent_events.append(event)
                except ValueError:
                    # Skip events with invalid date format
                    continue
            
            # Sort by date (most recent first) and limit
            recent_events.sort(key=lambda x: x.get('date', ''), reverse=True)
            return recent_events[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching recent tournaments: {str(e)}")
            return []
    
    async def get_live_tournament_leaderboard(self, tour: str = "pga") -> List[Dict[str, Any]]:
        """Get live tournament leaderboard using the Live Tournament Stats API"""
        try:
            logger.info(f"🏆 Fetching live tournament leaderboard for tour: {tour}")
            
            # Use the Live Tournament Stats API which provides the actual leaderboard
            live_stats = await self.get_live_tournament_stats(
                stats="sg_total,sg_ott,sg_app,sg_arg,sg_putt,distance,accuracy,gir,prox_fw,scrambling", 
                round_type="event_cumulative", 
                display="value"
            )
            
            logger.info(f"🏆 Live stats response type: {type(live_stats)}")
            logger.info(f"🏆 Live stats data: {live_stats}")
            
            if not isinstance(live_stats, dict):
                logger.error(f"🏆 Expected dict, got {type(live_stats)}")
                return [{
                    "error": "invalid_response",
                    "message": "Invalid response format from live tournament stats API",
                    "suggestion": "Try again later or check if tournament is currently being played."
                }]
            
            if 'live_stats' not in live_stats:
                logger.warning(f"🏆 No live_stats key in response. Keys: {live_stats.keys()}")
                return [{
                    "error": "no_live_data",
                    "message": "No live tournament data available. Tournament may not be in progress.",
                    "suggestion": "Check if tournament is currently being played or try again during tournament hours.",
                    "debug_info": f"Response keys: {list(live_stats.keys())}"
                }]
            
            stats_data = live_stats['live_stats']
            logger.info(f"🏆 Processing {len(stats_data)} players from live tournament stats")
            
            # Extract tournament info
            tournament_info = {
                'course_name': live_stats.get('course_name'),
                'event_name': live_stats.get('event_name'),
                'last_updated': live_stats.get('last_updated')
            }
            logger.info(f"🏆 Tournament info: {tournament_info}")
            
            leaderboard = []
            for player in stats_data:
                player_data = {
                    'player_name': player.get('player_name', 'Unknown Player'),
                    'dg_id': player.get('dg_id'),
                    'position': player.get('position'),  # Position from API
                    'total_score': player.get('total', 0),  # Score relative to par
                    'thru': player.get('thru', 'F'),  # Holes completed
                    'today': player.get('today'),  # Today's round number
                    'made_cut': True,  # Assume made cut if in live stats
                    'rounds': [],  # Individual round scores not available in live stats
                    
                    # Strokes gained stats
                    'sg_total': player.get('sg_total'),
                    'sg_ott': player.get('sg_ott'),  # Off the tee
                    'sg_app': player.get('sg_app'),  # Approach
                    'sg_arg': player.get('sg_arg'),  # Around the green
                    'sg_putt': player.get('sg_putt'),  # Putting
                    
                    # Traditional stats
                    'distance': player.get('distance'),  # Driving distance
                    'accuracy': player.get('accuracy'),  # Driving accuracy
                    'gir': player.get('gir'),  # Greens in regulation
                    'prox_fw': player.get('prox_fw'),  # Proximity to hole from fairway
                    'scrambling': player.get('scrambling'),  # Scrambling percentage
                    
                    # Tournament context
                    'course_name': tournament_info['course_name'],
                    'event_name': tournament_info['event_name'],
                    'last_updated': tournament_info['last_updated']
                }
                leaderboard.append(player_data)
            
            # Sort leaderboard by position if available, otherwise by total score
            if any(p.get('position') for p in leaderboard):
                leaderboard.sort(key=lambda x: int(x.get('position', 999)) if x.get('position') and str(x.get('position')).isdigit() else 999)
            else:
                leaderboard.sort(key=lambda x: x.get('total_score', 999))
            
            logger.info(f"🏆 Generated live leaderboard with {len(leaderboard)} players for tour: {tour}")
            if leaderboard and len(leaderboard) > 0:
                logger.info(f"🏆 Sample leaderboard entry: {leaderboard[0]}")
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"🏆 Error fetching live tournament leaderboard: {str(e)}")
            return [{
                "error": "fetch_failed",
                "message": f"Failed to fetch live tournament data: {str(e)}",
                "suggestion": "Please try again later or check if tournament is currently in progress."
            }]

    async def get_tournament_leaderboard(self, tour: str, event_id: str, year: int) -> List[Dict[str, Any]]:
        """Get tournament leaderboard/results with historical odds"""
        try:
            # Get both tournament data and historical odds in parallel
            tournament_data, historical_odds = await asyncio.gather(
                self.get_historical_tournament_data(tour, event_id, year),
                self.get_historical_outright_odds(tour, event_id, year, "win", "pinnacle"),
                return_exceptions=True
            )
            
            # Handle potential exceptions
            if isinstance(tournament_data, Exception):
                logger.error(f"Error fetching tournament data: {tournament_data}")
                tournament_data = []
            if isinstance(historical_odds, Exception):
                logger.error(f"Error fetching historical odds: {historical_odds}")
                historical_odds = []
            
            if not tournament_data:
                logger.warning(f"No tournament data found for {tour}/{event_id}/{year}")
                return []
            
            # Check if we got a subscription error
            if (isinstance(tournament_data, list) and len(tournament_data) > 0 and 
                isinstance(tournament_data[0], dict) and tournament_data[0].get('error') == 'subscription_required'):
                return tournament_data  # Return the error structure
            
            # Create odds lookup by player name
            odds_lookup = {}
            if historical_odds and isinstance(historical_odds, list):
                for odds_record in historical_odds:
                    player_name = odds_record.get('player_name')
                    if player_name:
                        odds_lookup[player_name] = {
                            'opening_odds': odds_record.get('opening_odds'),
                            'closing_odds': odds_record.get('closing_odds'),
                            'outcome': odds_record.get('outcome')
                        }
            
            # Process and aggregate player data
            player_results = {}
            
            if not isinstance(tournament_data, list):
                logger.error(f"Tournament data is not a list: {type(tournament_data)}")
                return []
            
            for round_data in tournament_data:
                player_id = round_data.get('dg_id')
                player_name = round_data.get('player_name', '')
                
                if not player_id:
                    continue
                
                if player_id not in player_results:
                    # Get odds for this player
                    player_odds = odds_lookup.get(player_name, {})
                    
                    player_results[player_id] = {
                        'player_name': player_name,
                        'dg_id': player_id,
                        'total_score': 0,
                        'rounds': [],
                        'position': round_data.get('fin_text', ''),
                        'made_cut': True,  # Assume made cut if data exists
                        'opening_odds': player_odds.get('opening_odds'),
                        'closing_odds': player_odds.get('closing_odds'),
                        'odds_outcome': player_odds.get('outcome')
                    }
                
                # Add round score
                round_score = round_data.get('round_score')
                if round_score:
                    player_results[player_id]['rounds'].append(round_score)
                    player_results[player_id]['total_score'] += round_score
            
            # Convert to list and sort by total score
            leaderboard = list(player_results.values())
            leaderboard.sort(key=lambda x: x['total_score'] if x['total_score'] != 0 else float('inf'))
            
            logger.info(f"Generated leaderboard with {len(leaderboard)} players for {tour}/{event_id}/{year}")
            return leaderboard
            
        except Exception as e:
            logger.error(f"Error fetching tournament leaderboard: {str(e)}")
            return []
    
    async def get_players_with_rankings(self) -> List[Dict[str, Any]]:
        """Get players with their current rankings"""
        try:
            # Get both player list and rankings
            players_data, rankings_data = await asyncio.gather(
                self.get_player_list(),
                self.get_dg_rankings()
            )
            
            # Create rankings lookup
            rankings_lookup = {}
            if rankings_data:
                for i, player in enumerate(rankings_data):
                    dg_id = player.get('dg_id')
                    if dg_id:
                        rankings_lookup[dg_id] = {
                            'ranking': i + 1,
                            'skill_estimate': player.get('skill_estimate'),
                            'owgr_rank': player.get('owgr_rank')
                        }
            
            # Merge player data with rankings
            players_with_rankings = []
            if players_data:
                for player in players_data:
                    dg_id = player.get('dg_id')
                    player_info = {
                        'dg_id': dg_id,
                        'player_name': player.get('player_name', ''),
                        'country': player.get('country', ''),
                        'amateur': player.get('amateur', False),
                        'dg_ranking': None,
                        'skill_estimate': None,
                        'owgr_rank': None
                    }
                    
                    # Add ranking info if available
                    if dg_id in rankings_lookup:
                        ranking_info = rankings_lookup[dg_id]
                        player_info.update({
                            'dg_ranking': ranking_info['ranking'],
                            'skill_estimate': ranking_info['skill_estimate'],
                            'owgr_rank': ranking_info['owgr_rank']
                        })
                    
                    players_with_rankings.append(player_info)
            
            # Sort by DG ranking (ranked players first, then unranked)
            players_with_rankings.sort(key=lambda x: (
                x['dg_ranking'] is None,  # False for ranked players (comes first)
                x['dg_ranking'] or float('inf'),  # Actual ranking for ranked players
                x['player_name']  # Alphabetical for unranked players
            ))
            
            return players_with_rankings
            
        except Exception as e:
            logger.error(f"Error fetching players with rankings: {str(e)}")
            return []


# Create a singleton instance
datagolf_service = DataGolfService() 