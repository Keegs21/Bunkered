import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import models
from app.services.datagolf_service import DataGolfService

logger = logging.getLogger(__name__)

class SyncService:
    def __init__(self, db: Session):
        self.db = db
        self.datagolf_service = DataGolfService()
    
    async def sync_tournament_with_players(self, tournament_event_id: str, tour: str = "pga") -> Optional[models.Tournament]:
        """
        Sync a tournament and all its players from DataGolf to local database.
        Returns the local tournament record or None if sync fails.
        """
        try:
            print(f"🔄 Syncing tournament {tournament_event_id} with players...")
            
            # First, get tournament schedule to find this tournament
            schedule_data = await self.datagolf_service.get_schedule(tour=tour)
            tournament_info = None
            
            if schedule_data and 'schedule' in schedule_data:
                for tournament in schedule_data['schedule']:
                    if str(tournament.get('event_id')) == str(tournament_event_id):
                        tournament_info = tournament
                        break
            
            if not tournament_info:
                print(f"🔴 Tournament {tournament_event_id} not found in schedule")
                return None
            
            # Sync tournament to local database
            local_tournament = await self.sync_tournament(tournament_info)
            if not local_tournament:
                print(f"🔴 Failed to sync tournament {tournament_event_id}")
                return None
            
            # Get player rankings/data from DataGolf
            print(f"🔄 Fetching player data for tournament {tournament_event_id}...")
            players_data = await self.datagolf_service.get_dg_rankings()
            
            if not players_data:
                print(f"🔴 No player data available for tournament {tournament_event_id}")
                return local_tournament
            
            # Sync players to local database
            synced_players = await self.sync_players(players_data)
            print(f"🟢 Synced {len(synced_players)} players to local database")
            
            return local_tournament
            
        except Exception as e:
            logger.error(f"Error syncing tournament {tournament_event_id}: {str(e)}")
            print(f"🔴 Error syncing tournament {tournament_event_id}: {str(e)}")
            return None
    
    async def sync_tournament(self, tournament_data: Dict[str, Any]) -> Optional[models.Tournament]:
        """
        Sync a single tournament from DataGolf to local database.
        """
        try:
            datagolf_id = str(tournament_data.get('event_id'))
            
            # Check if tournament already exists
            existing_tournament = self.db.query(models.Tournament).filter(
                models.Tournament.datagolf_tournament_id == datagolf_id
            ).first()
            
            if existing_tournament:
                print(f"🔄 Tournament {datagolf_id} already exists, updating...")
                # Update existing tournament
                existing_tournament.name = tournament_data.get('event_name', existing_tournament.name)
                
                # Only update dates if we have valid data
                start_date = self._parse_date(tournament_data.get('start_date'))
                if start_date:
                    existing_tournament.start_date = start_date  # type: ignore
                
                end_date = self._parse_date(tournament_data.get('end_date'))
                if end_date:
                    existing_tournament.end_date = end_date  # type: ignore
                
                existing_tournament.course_name = tournament_data.get('course', existing_tournament.course_name)
                existing_tournament.purse = tournament_data.get('purse', existing_tournament.purse)
                existing_tournament.year = tournament_data.get('calendar_year', existing_tournament.year)
                
                self.db.commit()
                self.db.refresh(existing_tournament)
                return existing_tournament
            else:
                print(f"🔄 Creating new tournament {datagolf_id}...")
                # Create new tournament
                new_tournament = models.Tournament(
                    name=tournament_data.get('event_name', 'Unknown Tournament'),
                    year=tournament_data.get('calendar_year', datetime.now().year),
                    start_date=self._parse_date(tournament_data.get('start_date')),
                    end_date=self._parse_date(tournament_data.get('end_date')),
                    course_name=tournament_data.get('course'),
                    purse=tournament_data.get('purse'),
                    datagolf_tournament_id=datagolf_id,
                    is_active=True,
                    is_completed=False
                )
                
                self.db.add(new_tournament)
                self.db.commit()
                self.db.refresh(new_tournament)
                return new_tournament
                
        except Exception as e:
            logger.error(f"Error syncing tournament: {str(e)}")
            print(f"🔴 Error syncing tournament: {str(e)}")
            return None
    
    async def sync_players(self, players_data: List[Dict[str, Any]]) -> List[models.Player]:
        """
        Sync multiple players from DataGolf to local database.
        """
        synced_players = []
        
        try:
            for player_data in players_data:
                synced_player = await self.sync_player(player_data)
                if synced_player:
                    synced_players.append(synced_player)
            
            return synced_players
            
        except Exception as e:
            logger.error(f"Error syncing players: {str(e)}")
            print(f"🔴 Error syncing players: {str(e)}")
            return synced_players
    
    async def sync_player(self, player_data: Dict[str, Any]) -> Optional[models.Player]:
        """
        Sync a single player from DataGolf to local database.
        """
        try:
            datagolf_id = str(player_data.get('dg_id'))
            
            # Check if player already exists
            existing_player = self.db.query(models.Player).filter(
                models.Player.datagolf_player_id == datagolf_id
            ).first()
            
            if existing_player:
                # Update existing player
                existing_player.name = player_data.get('player_name', existing_player.name)
                existing_player.country = player_data.get('country', existing_player.country)
                existing_player.world_ranking = player_data.get('owgr', existing_player.world_ranking)
                
                self.db.commit()
                self.db.refresh(existing_player)
                return existing_player
            else:
                # Create new player
                new_player = models.Player(
                    name=player_data.get('player_name', 'Unknown Player'),
                    datagolf_player_id=datagolf_id,
                    country=player_data.get('country'),
                    world_ranking=player_data.get('owgr')
                )
                
                self.db.add(new_player)
                self.db.commit()
                self.db.refresh(new_player)
                return new_player
                
        except Exception as e:
            logger.error(f"Error syncing player: {str(e)}")
            print(f"🔴 Error syncing player: {str(e)}")
            return None
    
    def get_local_tournament_by_datagolf_id(self, datagolf_tournament_id: str) -> Optional[models.Tournament]:
        """
        Get local tournament by DataGolf tournament ID.
        """
        return self.db.query(models.Tournament).filter(
            models.Tournament.datagolf_tournament_id == str(datagolf_tournament_id)
        ).first()
    
    def get_local_players_by_datagolf_ids(self, datagolf_player_ids: List[str]) -> List[models.Player]:
        """
        Get local players by DataGolf player IDs.
        """
        return self.db.query(models.Player).filter(
            models.Player.datagolf_player_id.in_([str(pid) for pid in datagolf_player_ids])
        ).all()
    
    def _parse_date(self, date_string: Optional[str]) -> Optional[datetime]:
        """
        Parse date string to datetime object.
        """
        if not date_string:
            return None
        
        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ']:
                try:
                    return datetime.strptime(date_string, fmt)
                except ValueError:
                    continue
            
            # If no format works, return None
            return None
            
        except Exception:
            return None 