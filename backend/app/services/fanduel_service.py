"""
FanDuel Odds Integration Service

This service provides live odds data for golf tournaments, integrating with DataGolf
where possible and providing FanDuel-style odds calculations for fantasy golf scoring.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import httpx

from app.services.datagolf_service import datagolf_service
from app.core.fantasy_scoring import FantasyScoring
from app.database import models

logger = logging.getLogger(__name__)


class FanDuelOddsService:
    """Service for integrating FanDuel-style odds with fantasy golf"""
    
    def __init__(self):
        self.base_url = "https://api.fanduel.com"  # Placeholder for future FanDuel API
        self.timeout = 30
        
    async def get_tournament_odds(self, tournament_event_id: str, tour: str = "pga") -> Dict[str, Any]:
        """
        Get live tournament odds from FanDuel or simulate based on DataGolf data
        
        Args:
            tournament_event_id: Tournament event ID
            tour: Tour name (pga, euro, etc.)
            
        Returns:
            Dictionary with player odds and tournament info
        """
        try:
            logger.info(f"Starting odds fetch for tournament: {tournament_event_id}, tour: {tour}")
            
            # Try to get real FanDuel odds from DataGolf
            try:
                # First, get current year for odds lookup
                from datetime import datetime
                current_year = datetime.now().year
                
                print(f"🟡 ====== STARTING DATAGOLF API CALL ======")
                print(f"🟡 Tournament ID: {tournament_event_id}")
                print(f"🟡 Tour: {tour}")
                print(f"🟡 Current Year: {current_year}")
                print(f"🟡 About to call DataGolf betting tools API...")
                print(f"🟡 ====== DEBUGGING DATAGOLF API CALL ======")
                
                logger.info(f"====== STARTING DATAGOLF API CALL ======")
                logger.info(f"Tournament ID: {tournament_event_id}")
                logger.info(f"Tour: {tour}")
                logger.info(f"Current Year: {current_year}")
                logger.info(f"About to call DataGolf betting tools API...")
                logger.info(f"====== DEBUGGING DATAGOLF API CALL ======")
                
                # Make the exact API call to DataGolf betting tools
                betting_odds = await datagolf_service.get_live_outright_odds(
                    tour=tour,
                    book="fanduel",  # This parameter might be ignored by betting tools
                    odds_format="american",
                    file_format="json"
                )
                
                # Log everything about the response
                print(f"🟡 ====== DATAGOLF API RESPONSE ======")
                print(f"🟡 Response type: {type(betting_odds)}")
                print(f"🟡 Response length: {len(betting_odds) if isinstance(betting_odds, (list, dict)) else 'N/A'}")
                print(f"🟡 Is list: {isinstance(betting_odds, list)}")
                print(f"🟡 Is dict: {isinstance(betting_odds, dict)}")
                print(f"🟡 Is None: {betting_odds is None}")
                print(f"🟡 Raw response (full): {betting_odds}")
                
                # If it's a dict, show the structure
                if isinstance(betting_odds, dict):
                    print(f"🟡 Dict keys: {list(betting_odds.keys())}")
                    for key, value in betting_odds.items():
                        if isinstance(value, (list, dict)):
                            print(f"🟡   {key}: {type(value)} with {len(value) if hasattr(value, '__len__') else 'N/A'} items")
                            if isinstance(value, list) and len(value) > 0:
                                print(f"🟡     First item in {key}: {value[0]}")
                        else:
                            print(f"🟡   {key}: {value}")
                            
                print(f"🟡 ====== END DATAGOLF RESPONSE ======")
                
                logger.info(f"====== DATAGOLF API RESPONSE ======")
                logger.info(f"Response type: {type(betting_odds)}")
                logger.info(f"Response length: {len(betting_odds) if isinstance(betting_odds, (list, dict)) else 'N/A'}")
                logger.info(f"Is list: {isinstance(betting_odds, list)}")
                logger.info(f"Is dict: {isinstance(betting_odds, dict)}")
                logger.info(f"Is None: {betting_odds is None}")
                logger.info(f"Raw response (full): {betting_odds}")
                logger.info(f"====== END DATAGOLF RESPONSE ======")
                
                # Process real FanDuel data if we have it
                if isinstance(betting_odds, list) and len(betting_odds) > 0:
                    print(f"🟡 Processing {len(betting_odds)} players with real FanDuel odds")
                    player_odds = await self._process_real_fanduel_odds(betting_odds, tour)
                else:
                    print(f"🟡 No valid betting odds data, falling back to estimated odds")
                    player_odds = await self._create_estimated_odds_from_rankings(tour)
                    
            except Exception as dg_error:
                print(f"🔴 ====== EXCEPTION IN DATAGOLF CALL ======")
                print(f"🔴 Exception type: {type(dg_error)}")
                print(f"🔴 Exception message: {str(dg_error)}")
                print(f"🔴 Exception args: {dg_error.args}")
                print(f"🔴 ====== END EXCEPTION ======")
                print(f"🔴 Falling back to estimated odds from rankings")
                
                logger.error(f"====== EXCEPTION IN DATAGOLF CALL ======")
                logger.error(f"Exception type: {type(dg_error)}")
                logger.error(f"Exception message: {str(dg_error)}")
                logger.error(f"Exception args: {dg_error.args}")
                logger.error(f"====== END EXCEPTION ======")
                logger.info("Falling back to estimated odds from rankings")
                player_odds = await self._create_estimated_odds_from_rankings(tour)
            
            logger.info(f"Final player odds count: {len(player_odds)}")
            
            result = {
                "tournament_event_id": tournament_event_id,
                "tour": tour,
                "odds_type": "fanduel_from_datagolf",
                "last_updated": datetime.utcnow().isoformat(),
                "player_odds": player_odds,
                "total_players": len(player_odds),
                "data_source": "fanduel_datagolf" if any(p.get("data_source") == "fanduel_real" for p in player_odds) else "estimated"
            }
            
            logger.info(f"Returning result with {len(player_odds)} players")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching tournament odds: {str(e)}")
            return {
                "tournament_event_id": tournament_event_id,
                "tour": tour,
                "error": str(e),
                "player_odds": []
            }
    
    def _create_mock_tournament_field(self, rankings: List[Dict[str, Any]], tournament_event_id: str) -> List[Dict[str, Any]]:
        """
        Create a mock tournament field with realistic player names and odds
        
        Args:
            rankings: DataGolf rankings if available
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with mock betting odds
        """
        players = []
        
        if rankings and len(rankings) > 0:
            # Use real player data from rankings
            for i, player in enumerate(rankings[:80]):  # Top 80 players
                # Calculate American odds based on ranking position
                decimal_odds = 8.0 + (i * 1.5)  # Start at 8:1, increase with ranking
                american_odds = self._convert_to_american_odds(decimal_odds)
                fantasy_points = self._calculate_logarithmic_fantasy_points(decimal_odds, i)
                
                player_data = {
                    "player_name": player.get("player_name", f"Player {i+1}"),
                    "dg_id": player.get("dg_id", i+1),
                    "country": player.get("country", "USA"),
                    "fanduel_win_odds": american_odds,
                    "potential_fantasy_points": round(fantasy_points, 1),
                    "confidence": "medium",
                    "data_source": "rankings_based"
                }
                players.append(player_data)
        else:
            # Create mock data if no rankings available
            mock_players = [
                "Scottie Scheffler", "Rory McIlroy", "Jon Rahm", "Viktor Hovland", 
                "Xander Schauffele", "Patrick Cantlay", "Wyndham Clark", "Collin Morikawa",
                "Max Homa", "Tony Finau", "Jordan Spieth", "Justin Thomas",
                "Hideki Matsuyama", "Tommy Fleetwood", "Matt Fitzpatrick", "Tyrrell Hatton",
                "Shane Lowry", "Russell Henley", "Jason Day", "Brian Harman",
                "Rickie Fowler", "Sam Burns", "Cameron Young", "Keegan Bradley",
                "Tom Kim", "Lucas Glover", "Sungjae Im", "Adam Scott",
                "Billy Horschel", "Taylor Pendrith", "Nick Taylor", "Corey Conners",
                "Harris English", "Denny McCarthy", "Chris Kirk", "J.T. Poston",
                "Si Woo Kim", "Aaron Rai", "Matt Wallace", "Erik van Rooyen",
                "Sahith Theegala", "Alex Noren", "Kurt Kitayama", "Davis Thompson",
                "Nick Dunlap", "Ben Griffin", "Cam Davis", "Stephan Jaeger",
                "Akshay Bhatia", "Jake Knapp", "Peter Malnati", "Austin Eckroat"
            ]
            
            for i, name in enumerate(mock_players):
                decimal_odds = 8.0 + (i * 2.0)  # Favorite starts at 8:1
                american_odds = self._convert_to_american_odds(decimal_odds)
                fantasy_points = self._calculate_logarithmic_fantasy_points(decimal_odds, i)
                
                player_data = {
                    "player_name": name,
                    "dg_id": i + 1000,  # Mock IDs starting from 1000
                    "country": "USA",
                    "fanduel_win_odds": american_odds,
                    "potential_fantasy_points": round(fantasy_points, 1),
                    "confidence": "low",
                    "data_source": "mock"
                }
                players.append(player_data)
        
        logger.info(f"Created tournament field with {len(players)} players")
        return players
    
    def _process_live_betting_odds(self, betting_odds: List[Dict[str, Any]], tournament_event_id: str) -> List[Dict[str, Any]]:
        """
        Process live betting odds from DataGolf betting tools API and extract FanDuel odds
        
        Args:
            betting_odds: Live betting odds data from DataGolf betting tools
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with real FanDuel odds and projected fantasy points
        """
        from app.core.fantasy_scoring import FantasyScoring
        from app.database.models import FantasyLeague
        
        # Create a default league for fantasy scoring calculations
        default_league = FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=100.0,
            top_5_bonus=50.0,
            top_10_bonus=25.0,
            made_cut_bonus=10.0,
            odds_multiplier=1.0
        )
        
        scorer = FantasyScoring(default_league)
        players = []
        
        logger.info(f"Processing {len(betting_odds)} live betting odds records")
        
        # Look for FanDuel odds in the response
        fanduel_players = {}
        
        # DEBUG: Show the structure of the first few records
        logger.info(f"BETTING ODDS SAMPLE: {betting_odds[:2] if len(betting_odds) > 1 else betting_odds}")
        
        for odds_record in betting_odds:
            # DEBUG: Show what fields are in each record
            logger.info(f"ODDS RECORD KEYS: {list(odds_record.keys()) if isinstance(odds_record, dict) else 'Not a dict'}")
            
            # Check if this is FanDuel data
            sportsbook = odds_record.get('sportsbook', '').lower()
            book = odds_record.get('book', '').lower()
            
            logger.info(f"CHECKING: sportsbook='{sportsbook}', book='{book}'")
            
            if 'fanduel' not in sportsbook and 'fanduel' not in book:
                continue
                
            player_name = odds_record.get('player_name', '').strip()
            if not player_name:
                continue
            
            # Get American odds for FanDuel
            american_odds = odds_record.get('fanduel_odds') or odds_record.get('odds')
            if american_odds is None:
                continue
            
            # Convert American odds to decimal for fantasy scoring calculations
            if american_odds >= 0:
                decimal_odds = (american_odds / 100) + 1
            else:
                decimal_odds = (100 / abs(american_odds)) + 1
            
            # Calculate projected fantasy points using various scenarios
            win_points = scorer.calculate_player_points(1, True, decimal_odds)
            top5_points = scorer.calculate_player_points(3, True, decimal_odds)
            top10_points = scorer.calculate_player_points(8, True, decimal_odds)
            made_cut_points = scorer.calculate_player_points(45, True, decimal_odds)
            missed_cut_points = scorer.calculate_player_points(None, False, decimal_odds)
            
            # Weight scenarios by realistic probabilities based on odds
            win_prob = min(0.15, 1 / decimal_odds)
            top5_prob = min(0.25, 3 / decimal_odds) * (1 - win_prob)
            top10_prob = min(0.35, 6 / decimal_odds) * (1 - win_prob - top5_prob)
            made_cut_prob = min(0.75, 20 / decimal_odds) * (1 - win_prob - top5_prob - top10_prob)
            missed_cut_prob = 1 - win_prob - top5_prob - top10_prob - made_cut_prob
            
            projected_points = (
                win_points * win_prob +
                top5_points * top5_prob +
                top10_points * top10_prob +
                made_cut_points * made_cut_prob +
                missed_cut_points * missed_cut_prob
            )
            
            fanduel_players[player_name] = {
                "player_name": player_name,
                "dg_id": odds_record.get('dg_id', player_name.replace(' ', '_').lower()),
                "country": odds_record.get('country', 'USA'),
                "fanduel_win_odds": int(american_odds),
                "potential_fantasy_points": round(projected_points, 1),
                "confidence": "high",
                "data_source": "fanduel_live"
            }
        
        # Convert to list and sort by odds (favorites first)
        players = list(fanduel_players.values())
        players.sort(key=lambda x: abs(x.get("fanduel_win_odds", 0)) if x.get("fanduel_win_odds", 0) < 0 else x.get("fanduel_win_odds", 999))
        
        logger.info(f"Extracted {len(players)} players with FanDuel odds from betting tools data")
        return players
    
    def _process_fanduel_odds(self, fanduel_odds: List[Dict[str, Any]], tournament_event_id: str) -> List[Dict[str, Any]]:
        """
        Process real FanDuel odds from DataGolf API and calculate fantasy points
        
        Args:
            fanduel_odds: FanDuel odds data from DataGolf
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with real FanDuel odds and projected fantasy points
        """
        from app.core.fantasy_scoring import FantasyScoring
        from app.database.models import FantasyLeague
        
        # Create a default league for fantasy scoring calculations
        default_league = FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=100.0,
            top_5_bonus=50.0,
            top_10_bonus=25.0,
            made_cut_bonus=10.0,
            odds_multiplier=1.0
        )
        
        scorer = FantasyScoring(default_league)
        players = []
        
        logger.info(f"Processing {len(fanduel_odds)} FanDuel odds records")
        
        for odds_record in fanduel_odds:
            player_name = odds_record.get('player_name', '').strip()
            if not player_name:
                continue
            
            # Get American odds (already in American format from DataGolf)
            american_odds = odds_record.get('opening_odds') or odds_record.get('closing_odds')
            if american_odds is None:
                continue
            
            # Convert American odds to decimal for fantasy scoring calculations
            if american_odds >= 0:
                decimal_odds = (american_odds / 100) + 1
            else:
                decimal_odds = (100 / abs(american_odds)) + 1
            
            # Calculate projected fantasy points using various scenarios
            # Use probability-weighted average of different finish scenarios
            win_points = scorer.calculate_player_points(1, True, decimal_odds)
            top5_points = scorer.calculate_player_points(3, True, decimal_odds)
            top10_points = scorer.calculate_player_points(8, True, decimal_odds)
            made_cut_points = scorer.calculate_player_points(45, True, decimal_odds)
            missed_cut_points = scorer.calculate_player_points(None, False, decimal_odds)
            
            # Weight scenarios by realistic probabilities based on odds
            win_prob = min(0.15, 1 / decimal_odds)  # Cap at 15% max
            top5_prob = min(0.25, 3 / decimal_odds) * (1 - win_prob)
            top10_prob = min(0.35, 6 / decimal_odds) * (1 - win_prob - top5_prob)
            made_cut_prob = min(0.75, 20 / decimal_odds) * (1 - win_prob - top5_prob - top10_prob)
            missed_cut_prob = 1 - win_prob - top5_prob - top10_prob - made_cut_prob
            
            projected_points = (
                win_points * win_prob +
                top5_points * top5_prob +
                top10_points * top10_prob +
                made_cut_points * made_cut_prob +
                missed_cut_points * missed_cut_prob
            )
            
            player_data = {
                "player_name": player_name,
                "dg_id": odds_record.get('dg_id', player_name.replace(' ', '_').lower()),
                "country": odds_record.get('country', 'USA'),
                "fanduel_win_odds": int(american_odds),
                "potential_fantasy_points": round(projected_points, 1),
                "confidence": "high",
                "data_source": "fanduel_real",
                "odds_details": {
                    "opening_odds": odds_record.get('opening_odds'),
                    "closing_odds": odds_record.get('closing_odds'),
                    "outcome": odds_record.get('outcome')
                }
            }
            players.append(player_data)
        
        # Sort by odds (favorites first - lower American odds for favorites)
        players.sort(key=lambda x: abs(x.get("fanduel_win_odds", 0)) if x.get("fanduel_win_odds", 0) < 0 else x.get("fanduel_win_odds", 999))
        
        logger.info(f"Processed {len(players)} players with real FanDuel odds")
        return players
    
    def _process_predictions_data(self, predictions_data: Dict[str, Any], tournament_event_id: str) -> List[Dict[str, Any]]:
        """
        Process predictions data from DataGolf live/pre-tournament predictions
        
        Args:
            predictions_data: Predictions data from DataGolf
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with odds and projected fantasy points
        """
        # For now, fall back to estimated odds since we need the betting tools endpoint
        # This is a temporary method until we implement the proper betting tools processing
        return []
    
    def _process_betting_tools_odds(self, betting_odds: List[Dict[str, Any]], tournament_event_id: str) -> List[Dict[str, Any]]:
        """
        Process betting tools odds from DataGolf betting tools API
        Extract FanDuel odds from the multi-sportsbook response
        
        Args:
            betting_odds: Betting odds data from DataGolf betting tools
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with real FanDuel odds and projected fantasy points
        """
        from app.core.fantasy_scoring import FantasyScoring
        from app.database.models import FantasyLeague
        
        # Create a default league for fantasy scoring calculations
        default_league = FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=100.0,
            top_5_bonus=50.0,
            top_10_bonus=25.0,
            made_cut_bonus=10.0,
            odds_multiplier=1.0
        )
        
        scorer = FantasyScoring(default_league)
        players = []
        
        logger.info(f"Processing {len(betting_odds)} betting tools odds records")
        
        for odds_record in betting_odds:
            # DEBUG: Show what fields are in each record
            logger.info(f"ODDS RECORD KEYS: {list(odds_record.keys()) if isinstance(odds_record, dict) else 'Not a dict'}")
            
            player_name = odds_record.get('player_name', '').strip()
            if not player_name:
                continue
            
            # Look for FanDuel odds in the record
            # The betting tools endpoint returns odds from multiple sportsbooks
            fanduel_odds = None
            
            # Check different possible field names for FanDuel odds
            possible_fanduel_fields = [
                'fanduel_odds', 'fanduel_win_odds', 'fanduel', 
                'FanDuel', 'fd_odds', 'fd_win_odds'
            ]
            
            for field in possible_fanduel_fields:
                if field in odds_record:
                    fanduel_odds = odds_record[field]
                    logger.info(f"Found FanDuel odds in field '{field}': {fanduel_odds}")
                    break
            
            # If no specific FanDuel field, look for general odds field
            if fanduel_odds is None:
                fanduel_odds = odds_record.get('odds') or odds_record.get('win_odds')
                logger.info(f"Using general odds field: {fanduel_odds}")
            
            if fanduel_odds is None:
                logger.warning(f"No FanDuel odds found for player {player_name}")
                continue
            
            # Convert to American odds format if needed
            american_odds = int(fanduel_odds)
            
            # Convert American odds to decimal for fantasy scoring calculations
            if american_odds >= 0:
                decimal_odds = (american_odds / 100) + 1
            else:
                decimal_odds = (100 / abs(american_odds)) + 1
            
            # Calculate projected fantasy points using various scenarios
            win_points = scorer.calculate_player_points(1, True, decimal_odds)
            top5_points = scorer.calculate_player_points(3, True, decimal_odds)
            top10_points = scorer.calculate_player_points(8, True, decimal_odds)
            made_cut_points = scorer.calculate_player_points(45, True, decimal_odds)
            missed_cut_points = scorer.calculate_player_points(None, False, decimal_odds)
            
            # Weight scenarios by realistic probabilities based on odds
            win_prob = min(0.15, 1 / decimal_odds)
            top5_prob = min(0.25, 3 / decimal_odds) * (1 - win_prob)
            top10_prob = min(0.35, 6 / decimal_odds) * (1 - win_prob - top5_prob)
            made_cut_prob = min(0.75, 20 / decimal_odds) * (1 - win_prob - top5_prob - top10_prob)
            missed_cut_prob = 1 - win_prob - top5_prob - top10_prob - made_cut_prob
            
            projected_points = (
                win_points * win_prob +
                top5_points * top5_prob +
                top10_points * top10_prob +
                made_cut_points * made_cut_prob +
                missed_cut_points * missed_cut_prob
            )
            
            player_data = {
                "player_name": player_name,
                "dg_id": odds_record.get('dg_id', player_name.replace(' ', '_').lower()),
                "country": odds_record.get('country', 'USA'),
                "fanduel_win_odds": american_odds,
                "potential_fantasy_points": round(projected_points, 1),
                "confidence": "high",
                "data_source": "fanduel_betting_tools"
            }
            players.append(player_data)
        
        # Sort by odds (favorites first - lower American odds for favorites)
        players.sort(key=lambda x: abs(x.get("fanduel_win_odds", 0)) if x.get("fanduel_win_odds", 0) < 0 else x.get("fanduel_win_odds", 999))
        
        logger.info(f"Processed {len(players)} players with betting tools odds")
        return players
    
    async def _process_real_fanduel_odds(self, betting_odds: List[Dict[str, Any]], tour: str) -> List[Dict[str, Any]]:
        """
        Process real FanDuel odds data from DataGolf betting tools API
        
        Args:
            betting_odds: List of betting odds data from DataGolf
            tour: Tour name (e.g., "pga")
            
        Returns:
            List of players with real FanDuel odds and projected fantasy points
        """
        from app.core.fantasy_scoring import FantasyScoring
        from app.database.models import FantasyLeague
        
        # Create a default league for fantasy scoring calculations
        default_league = FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=100.0,
            top_5_bonus=50.0,
            top_10_bonus=25.0,
            made_cut_bonus=10.0,
            odds_multiplier=1.0
        )
        
        scorer = FantasyScoring(default_league)
        players = []
        
        print(f"🟡 Processing {len(betting_odds)} players with real FanDuel odds")
        
        for player_data in betting_odds:
            try:
                # Extract player information
                player_name = player_data.get("player_name", "Unknown Player")
                dg_id = player_data.get("dg_id")
                fanduel_odds_str = player_data.get("fanduel")
                
                if not fanduel_odds_str or not dg_id:
                    print(f"🟡 Skipping player {player_name} - missing fanduel odds or dg_id")
                    continue
                
                # Convert FanDuel odds string to integer (e.g., "+360" -> 360)
                try:
                    fanduel_odds = int(fanduel_odds_str.replace("+", ""))
                except (ValueError, AttributeError):
                    print(f"🟡 Skipping player {player_name} - invalid FanDuel odds: {fanduel_odds_str}")
                    continue
                
                # Calculate fantasy points using the existing scoring system
                fantasy_points = self._calculate_fantasy_points_from_american_odds(fanduel_odds, scorer)
                
                player_info = {
                    "player_name": player_name,
                    "dg_id": dg_id,
                    "country": "USA",  # Default country - could be enhanced with real data
                    "fanduel_win_odds": fanduel_odds,
                    "potential_fantasy_points": round(fantasy_points, 1),
                    "confidence": "high",  # Real FanDuel data has high confidence
                    "data_source": "fanduel_real"
                }
                players.append(player_info)
                
            except Exception as e:
                print(f"🟡 Error processing player {player_data}: {str(e)}")
                continue
        
        print(f"🟡 Successfully processed {len(players)} players with real FanDuel odds")
        logger.info(f"Successfully processed {len(players)} players with real FanDuel odds")
        
        return players
    
    def _calculate_fantasy_points_from_american_odds(self, american_odds: int, scorer: 'FantasyScoring') -> float:
        """
        Calculate projected fantasy points using advanced odds-weighted position system
        
        Key Features:
        - Miss cut = 0 points (strict rule)
        - Position-based points with exponential rewards for better finishes
        - Massive odds multiplier boost for long shots
        - Formula: position_points × odds_multiplier
        
        Args:
            american_odds: American odds (e.g., 360 for +360, -150 for -150)
            scorer: FantasyScoring instance
            
        Returns:
            Projected fantasy points based on probability-weighted scenarios
        """
        # Convert American odds to win probability
        if american_odds > 0:
            # Positive odds: probability = 100 / (odds + 100)
            win_probability = 100 / (american_odds + 100)
        else:
            # Negative odds: probability = abs(odds) / (abs(odds) + 100)  
            win_probability = abs(american_odds) / (abs(american_odds) + 100)
        
        # Calculate odds multiplier - rewards long shots heavily
        odds_multiplier = self._calculate_odds_multiplier(american_odds)
        
        # Define position-based base points (exponential curve)
        position_scenarios = {
            "1st": {"base_points": 1000, "probability_factor": win_probability},
            "2nd": {"base_points": 500, "probability_factor": win_probability * 2.5},  
            "3rd": {"base_points": 300, "probability_factor": win_probability * 4.0},
            "top_5": {"base_points": 200, "probability_factor": win_probability * 6.0},
            "top_10": {"base_points": 100, "probability_factor": win_probability * 12.0},
            "top_20": {"base_points": 50, "probability_factor": win_probability * 25.0},
            "top_30": {"base_points": 25, "probability_factor": win_probability * 40.0},
            "made_cut": {"base_points": 10, "probability_factor": min(win_probability * 70.0, 0.95)},
        }
        
        # Calculate probability-weighted expected points
        total_expected_points = 0.0
        
        for scenario_name, scenario in position_scenarios.items():
            # Cap probabilities at reasonable levels
            capped_probability = min(scenario["probability_factor"], 0.95)
            
            # Calculate scenario points: base_points × odds_multiplier × probability
            scenario_points = scenario["base_points"] * odds_multiplier * capped_probability
            total_expected_points += scenario_points
            
            # Debug logging for interesting scenarios
            if scenario_name in ["1st", "2nd", "3rd"] and capped_probability > 0.01:
                print(f"🟡 {scenario_name} scenario: {scenario['base_points']} base × {odds_multiplier:.1f} odds × {capped_probability:.3f} prob = {scenario_points:.1f} pts")
        
        print(f"🟡 American odds {american_odds:+d} → {odds_multiplier:.1f}x multiplier → {total_expected_points:.1f} total points")
        
        return total_expected_points
    
    def _calculate_odds_multiplier(self, american_odds: int) -> float:
        """
        Calculate odds multiplier with realistic scaling that rewards true long shots
        
        Realistic Examples:
        - +20000+ (200-1+): 15-25x multiplier (massive rewards for extreme long shots)
        - +10000 (100-1): 8x multiplier (significant bump for true long shots)
        - +5000 (50-1): 4x multiplier (reasonable for long shots that do hit)
        - +2000 (20-1): 2.5x multiplier 
        - +1000 (10-1): 1.8x multiplier
        - +500 (5-1): 1.4x multiplier
        - +200 (2-1): 1.2x multiplier
        - -150 (2-3): 0.8x multiplier (slight penalty for favorites)
        
        Args:
            american_odds: American odds
            
        Returns:
            Multiplier value with realistic scaling
        """
        if american_odds > 0:
            if american_odds >= 20000:
                # Extreme long shots: exponential scaling 20x+
                multiplier = 15 + (american_odds - 20000) / 2000
            elif american_odds >= 10000:
                # True long shots: significant bump 8-15x
                multiplier = 8 + (american_odds - 10000) / 1429  # Gets to 15x at 20000
            elif american_odds >= 5000:
                # Regular long shots: moderate scaling 4-8x  
                multiplier = 4 + (american_odds - 5000) / 1250   # Gets to 8x at 10000
            elif american_odds >= 1000:
                # Medium odds: gentle scaling 1.8-4x
                multiplier = 1.8 + (american_odds - 1000) / 1818  # Gets to 4x at 5000
            else:
                # Short odds: minimal scaling 1.0-1.8x
                multiplier = 1.0 + (american_odds / 1250)       # Gets to 1.8x at 1000
        else:
            # Negative odds: slight penalty for favorites
            abs_odds = abs(american_odds)
            if abs_odds <= 100:
                multiplier = 1.0  # Even money
            elif abs_odds <= 200:
                multiplier = 0.9  # Slight favorites
            elif abs_odds <= 500:
                multiplier = 0.8  # Strong favorites
            else:
                multiplier = 0.7  # Heavy favorites
        
        # Ensure reasonable bounds
        return max(min(multiplier, 50.0), 0.5)

    async def _create_estimated_odds_from_rankings(self, tour: str) -> List[Dict[str, Any]]:
        """
        Create estimated odds and fantasy points from DataGolf rankings when FanDuel data isn't available
        
        Args:
            tour: Tour name
            
        Returns:
            List of players with estimated odds and fantasy points
        """
        from app.core.fantasy_scoring import FantasyScoring
        from app.database.models import FantasyLeague
        
        try:
            print(f"🟡 Attempting to get DataGolf rankings for tour: {tour}")
            
            # Get player rankings from DataGolf
            rankings = await datagolf_service.get_dg_rankings()
            
            print(f"🟡 Rankings result: {type(rankings)}, length: {len(rankings) if isinstance(rankings, list) else 'N/A'}")
            
            if not rankings or len(rankings) == 0:
                print("🔴 No rankings data available, creating minimal mock data")
                logger.warning("No rankings data available, creating minimal mock data")
                return self._create_mock_tournament_field([], "")
            
            # Create a default league for fantasy scoring calculations
            default_league = FantasyLeague(
                name="Default",
                season_year=2024,
                win_points=100.0,
                top_5_bonus=50.0,
                top_10_bonus=25.0,
                made_cut_bonus=10.0,
                odds_multiplier=1.0
            )
            
            scorer = FantasyScoring(default_league)
            players = []
            
            print(f"🟡 Creating estimated odds from {len(rankings)} ranked players")
            logger.info(f"Creating estimated odds from {len(rankings)} ranked players")
            
            for i, player in enumerate(rankings[:80]):  # Top 80 players
                player_name = player.get("player_name", f"Player {i+1}").strip()
                if not player_name:
                    continue
                
                # Create realistic American odds based on ranking and skill
                skill = player.get("skill_decomp", 0.0)
                ranking_position = i + 1
                
                # Base odds calculation: better players get better odds
                if ranking_position == 1:
                    american_odds = -200  # Top player around -200
                elif ranking_position <= 5:
                    american_odds = -150 + (ranking_position * 30)  # Top 5: -150 to +30
                elif ranking_position <= 10:
                    american_odds = 200 + (ranking_position * 50)  # 6-10: +200 to +700
                elif ranking_position <= 25:
                    american_odds = 800 + (ranking_position * 80)  # 11-25: +800 to +2800
                else:
                    american_odds = 3000 + (ranking_position * 100)  # 26+: +3000+
                
                # Convert to decimal for calculations
                if american_odds >= 0:
                    decimal_odds = (american_odds / 100) + 1
                else:
                    decimal_odds = (100 / abs(american_odds)) + 1
                
                # Calculate projected fantasy points
                win_points = scorer.calculate_player_points(1, True, decimal_odds)
                top5_points = scorer.calculate_player_points(3, True, decimal_odds)
                top10_points = scorer.calculate_player_points(8, True, decimal_odds)
                made_cut_points = scorer.calculate_player_points(45, True, decimal_odds)
                missed_cut_points = scorer.calculate_player_points(None, False, decimal_odds)
                
                # Weight scenarios
                win_prob = min(0.15, 1 / decimal_odds)
                top5_prob = min(0.25, 3 / decimal_odds) * (1 - win_prob)
                top10_prob = min(0.35, 6 / decimal_odds) * (1 - win_prob - top5_prob)
                made_cut_prob = min(0.75, 20 / decimal_odds) * (1 - win_prob - top5_prob - top10_prob)
                missed_cut_prob = 1 - win_prob - top5_prob - top10_prob - made_cut_prob
                
                projected_points = (
                    win_points * win_prob +
                    top5_points * top5_prob +
                    top10_points * top10_prob +
                    made_cut_points * made_cut_prob +
                    missed_cut_points * missed_cut_prob
                )
                
                player_data = {
                    "player_name": player_name,
                    "dg_id": player.get("dg_id", i + 1),
                    "country": player.get("country", "USA"),
                    "fanduel_win_odds": american_odds,
                    "potential_fantasy_points": round(projected_points, 1),
                    "confidence": "medium",
                    "data_source": "estimated_from_rankings",
                    "ranking_position": ranking_position,
                    "skill_rating": skill
                }
                players.append(player_data)
            
            logger.info(f"Created estimated odds for {len(players)} players")
            return players
            
        except Exception as e:
            logger.error(f"Error creating estimated odds from rankings: {str(e)}")
            return self._create_mock_tournament_field([], "")
    
    def _convert_to_american_odds(self, decimal_odds: float) -> int:
        """
        Convert decimal odds to American odds format
        
        Args:
            decimal_odds: Decimal odds (e.g., 3.5)
            
        Returns:
            American odds (e.g., +250 or -140)
        """
        if decimal_odds >= 2.0:
            # Underdog (positive American odds)
            american_odds = int((decimal_odds - 1) * 100)
            return american_odds
        else:
            # Favorite (negative American odds)  
            american_odds = int(-100 / (decimal_odds - 1))
            return american_odds
    
    def _calculate_logarithmic_fantasy_points(self, decimal_odds: float, ranking_position: int) -> float:
        """
        Calculate fantasy points using logarithmic function based on odds and skill
        
        Args:
            decimal_odds: Decimal betting odds
            ranking_position: Player's ranking position (0-based)
            
        Returns:
            Expected fantasy points using logarithmic distribution
        """
        import math
        
        # Base fantasy points calculation using logarithmic distribution
        # Lower odds (favorites) have higher base potential, but diminishing returns
        
        # Convert odds to implied probability
        implied_probability = 1 / decimal_odds
        
        # Use logarithmic scale where favorites have higher potential
        # but the relationship isn't linear
        base_points = 50 + (math.log(1 + implied_probability * 10) * 30)
        
        # Add variance based on skill level (inversely related to ranking)
        skill_bonus = max(0, 20 - (ranking_position * 0.25))
        
        # Add some randomness/uncertainty factor
        uncertainty_factor = 1 + (0.1 * math.sin(ranking_position * 0.1))
        
        # Combine factors
        total_points = (base_points + skill_bonus) * uncertainty_factor
        
        # Ensure reasonable bounds (10-180 points)
        return max(10.0, min(180.0, total_points))
    
    def _process_tournament_odds(
        self, 
        live_predictions: Dict[str, Any], 
        pre_tournament: Dict[str, Any],
        rankings: List[Dict[str, Any]],
        tournament_event_id: str
    ) -> List[Dict[str, Any]]:
        """
        Process and combine odds data from multiple sources to create FanDuel-style odds
        
        Args:
            live_predictions: Live predictions from DataGolf
            pre_tournament: Pre-tournament predictions
            rankings: Player rankings
            tournament_event_id: Tournament event ID
            
        Returns:
            List of players with FanDuel-style odds
        """
        player_data = {}
        
        # Process live predictions if available
        if live_predictions.get("live_predictions"):
            for prediction in live_predictions["live_predictions"]:
                player_name = prediction.get("player_name", "").strip()
                if player_name:
                    player_data[player_name.lower()] = {
                        "name": player_name,
                        "dg_id": prediction.get("dg_id"),
                        "live_win_odds": prediction.get("win_odds"),
                        "live_top5_odds": prediction.get("top_5_odds"),
                        "live_top10_odds": prediction.get("top_10_odds"),
                        "live_make_cut_odds": prediction.get("make_cut_odds"),
                        "data_source": "live"
                    }
        
        # Process pre-tournament predictions
        if pre_tournament.get("predictions"):
            for prediction in pre_tournament["predictions"]:
                player_name = prediction.get("player_name", "").strip()
                if player_name:
                    key = player_name.lower()
                    if key in player_data:
                        # Update existing entry
                        player_data[key].update({
                            "pre_win_odds": prediction.get("win_odds"),
                            "pre_top5_odds": prediction.get("top_5_odds"),
                            "pre_top10_odds": prediction.get("top_10_odds"),
                            "pre_make_cut_odds": prediction.get("make_cut_odds")
                        })
                    else:
                        # Create new entry
                        player_data[key] = {
                            "name": player_name,
                            "dg_id": prediction.get("dg_id"),
                            "pre_win_odds": prediction.get("win_odds"),
                            "pre_top5_odds": prediction.get("top_5_odds"),
                            "pre_top10_odds": prediction.get("top_10_odds"),
                            "pre_make_cut_odds": prediction.get("make_cut_odds"),
                            "data_source": "pre_tournament"
                        }
        
        # Add rankings data for players not in predictions
        for player in rankings[:150]:  # Top 150 players
            player_name = player.get("player_name", "").strip()
            if player_name:
                key = player_name.lower()
                if key not in player_data:
                    # Create odds based on skill ratings
                    skill = player.get("skill_decomp", 0)
                    estimated_odds = self._calculate_odds_from_skill(skill)
                    
                    player_data[key] = {
                        "name": player_name,
                        "dg_id": player.get("dg_id"),
                        "estimated_win_odds": estimated_odds["win"],
                        "estimated_top5_odds": estimated_odds["top5"],
                        "estimated_top10_odds": estimated_odds["top10"],
                        "estimated_make_cut_odds": estimated_odds["make_cut"],
                        "skill_rating": skill,
                        "data_source": "estimated"
                    }
                else:
                    # Add skill rating to existing entry
                    player_data[key]["skill_rating"] = player.get("skill_decomp", 0)
                    player_data[key]["country"] = player.get("country")
        
        # Convert to FanDuel-style format and calculate fantasy points
        fanduel_players = []
        for player_info in player_data.values():
            fanduel_player = self._create_fanduel_player_odds(player_info)
            if fanduel_player:
                fanduel_players.append(fanduel_player)
        
        logger.info(f"Created {len(fanduel_players)} FanDuel player entries from {len(player_data)} source entries")
        
        # If we have no players, create a basic fallback dataset
        if not fanduel_players and rankings:
            logger.warning("No players from predictions, creating fallback from rankings only")
            for i, player in enumerate(rankings[:50]):  # Top 50 as fallback
                player_name = player.get("player_name", "").strip()
                if player_name:
                    skill = player.get("skill_decomp", 0)
                    estimated_odds = self._calculate_odds_from_skill(skill)
                    
                    american_win_odds = self._convert_to_american_odds(estimated_odds["win"])
                    fantasy_points = self._calculate_logarithmic_fantasy_points(estimated_odds["win"], i)
                    
                    fallback_player = {
                        "player_name": player_name,
                        "dg_id": player.get("dg_id"),
                        "country": player.get("country"),
                        "fanduel_win_odds": american_win_odds,
                        "potential_fantasy_points": round(fantasy_points, 1),
                        "confidence": "low",
                        "data_source": "fallback_rankings"
                    }
                    fanduel_players.append(fallback_player)
            
            logger.info(f"Created {len(fanduel_players)} fallback players from rankings")
        
        # Sort by odds (favorites first)
        fanduel_players.sort(key=lambda x: x.get("fanduel_win_odds", 999.0))
        
        return fanduel_players
    
    def _calculate_odds_from_skill(self, skill: float) -> Dict[str, float]:
        """
        Calculate tournament odds based on DataGolf skill rating
        
        Args:
            skill: DataGolf skill rating
            
        Returns:
            Dictionary with estimated odds for different markets
        """
        # Normalize skill (DataGolf skills typically range from -3 to 3)
        normalized_skill = max(-3, min(3, skill))
        
        # Convert to win probability (higher skill = higher probability)
        # Rough approximation: skill of 2.0 = ~5% win chance, 0 = ~1% win chance
        win_prob = max(0.001, 0.01 + (normalized_skill + 3) * 0.008)
        
        # Calculate decimal odds
        win_odds = 1 / win_prob
        top5_odds = 1 / min(0.8, win_prob * 8)  # ~8x more likely than winning
        top10_odds = 1 / min(0.9, win_prob * 15)  # ~15x more likely than winning
        make_cut_odds = 1 / min(0.95, win_prob * 30)  # ~30x more likely than winning
        
        return {
            "win": round(win_odds, 1),
            "top5": round(top5_odds, 1),
            "top10": round(top10_odds, 1),
            "make_cut": round(make_cut_odds, 1)
        }
    
    def _create_fanduel_player_odds(self, player_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create FanDuel-style player odds entry with fantasy points calculation
        
        Args:
            player_info: Combined player data from various sources
            
        Returns:
            FanDuel-style player odds dictionary
        """
        try:
            # Determine best available odds (prefer live > pre-tournament > estimated)
            win_odds = (
                player_info.get("live_win_odds") or 
                player_info.get("pre_win_odds") or 
                player_info.get("estimated_win_odds")
            )
            
            if not win_odds:
                return None
            
            # Get other market odds
            top5_odds = (
                player_info.get("live_top5_odds") or 
                player_info.get("pre_top5_odds") or 
                player_info.get("estimated_top5_odds")
            )
            
            top10_odds = (
                player_info.get("live_top10_odds") or 
                player_info.get("pre_top10_odds") or 
                player_info.get("estimated_top10_odds")
            )
            
            make_cut_odds = (
                player_info.get("live_make_cut_odds") or 
                player_info.get("pre_make_cut_odds") or 
                player_info.get("estimated_make_cut_odds")
            )
            
            # Convert odds to American format and calculate logarithmic fantasy points
            american_win_odds = self._convert_to_american_odds(win_odds)
            ranking_position = player_info.get("ranking_position", 50)  # Default middle ranking
            potential_points = self._calculate_logarithmic_fantasy_points(win_odds, ranking_position)
            
            return {
                "player_name": player_info["name"],
                "dg_id": player_info.get("dg_id"),
                "country": player_info.get("country"),
                "fanduel_win_odds": american_win_odds,
                "potential_fantasy_points": round(potential_points, 1),
                "skill_rating": player_info.get("skill_rating"),
                "data_source": player_info.get("data_source", "unknown"),
                "odds_confidence": self._calculate_odds_confidence(player_info)
            }
            
        except Exception as e:
            logger.error(f"Error creating FanDuel player odds: {str(e)}")
            return None
    
    def _calculate_fantasy_points_potential(self, win_odds: float) -> float:
        """
        Calculate potential fantasy points based on odds using existing scoring logic
        
        Args:
            win_odds: Decimal odds to win tournament
            
        Returns:
            Expected fantasy points based on various finish scenarios
        """
        # Create a mock league with default settings for calculation
        from app.database.models import FantasyLeague
        
        mock_league = FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=100.0,
            top_5_bonus=50.0,
            top_10_bonus=25.0,
            made_cut_bonus=10.0,
            odds_multiplier=1.0
        )
        
        scorer = FantasyScoring(mock_league)
        
        # Calculate points for various scenarios
        win_scenario = scorer.calculate_player_points(1, True, win_odds)
        top5_scenario = scorer.calculate_player_points(3, True, win_odds)
        top10_scenario = scorer.calculate_player_points(8, True, win_odds)
        make_cut_scenario = scorer.calculate_player_points(45, True, win_odds)
        miss_cut_scenario = scorer.calculate_player_points(None, False, win_odds)
        
        # Weight scenarios by probabilities based on odds
        win_prob = min(0.3, 1 / win_odds)
        top5_prob = min(0.4, 3 / win_odds) * (1 - win_prob)
        top10_prob = min(0.5, 6 / win_odds) * (1 - win_prob - top5_prob)
        make_cut_prob = min(0.8, 20 / win_odds) * (1 - win_prob - top5_prob - top10_prob)
        miss_cut_prob = 1 - win_prob - top5_prob - top10_prob - make_cut_prob
        
        expected_points = (
            win_scenario * win_prob +
            top5_scenario * top5_prob +
            top10_scenario * top10_prob +
            make_cut_scenario * make_cut_prob +
            miss_cut_scenario * miss_cut_prob
        )
        
        return expected_points
    
    def _calculate_odds_confidence(self, player_info: Dict[str, Any]) -> str:
        """
        Calculate confidence level in the odds based on data sources
        
        Args:
            player_info: Player information dictionary
            
        Returns:
            Confidence level string
        """
        if player_info.get("live_win_odds"):
            return "high"  # Live data is most reliable
        elif player_info.get("pre_win_odds"):
            return "medium"  # Pre-tournament data is good
        elif player_info.get("estimated_win_odds"):
            return "low"  # Estimated data is less reliable
        else:
            return "unknown"


# Create singleton instance
fanduel_service = FanDuelOddsService() 