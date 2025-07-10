from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator


class FantasyLeagueCreate(BaseModel):
    name: str
    season_year: int
    description: Optional[str] = None
    entry_fee: float = 0.0
    max_members: Optional[int] = None
    win_points: float = 100.0
    top_5_bonus: float = 50.0
    top_10_bonus: float = 25.0
    made_cut_bonus: float = 10.0
    odds_multiplier: float = 1.0


class FantasyLeagueResponse(BaseModel):
    id: int
    name: str
    season_year: int
    description: Optional[str] = None
    entry_fee: float
    max_members: Optional[int] = None
    status: str
    win_points: float
    top_5_bonus: float
    top_10_bonus: float
    made_cut_bonus: float
    odds_multiplier: float
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Schema for registering a team in a league (one-time action)
class FantasyTeamCreate(BaseModel):
    league_id: int
    team_name: Optional[str] = None


class FantasyTeamResponse(BaseModel):
    id: int
    user_id: int
    league_id: int
    team_name: Optional[str]
    total_points: float  # Season total
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for setting weekly lineup (3 golfers for each tournament)
class WeeklyLineupCreate(BaseModel):
    tournament_id: int
    player_ids: List[int]  # Should be exactly 3 players
    player_odds: List[float]  # Live odds for each player at time of submission
    
    @validator('player_ids')
    def validate_three_players(cls, v):
        if len(v) != 3:
            raise ValueError('Must select exactly 3 players')
        if len(set(v)) != 3:
            raise ValueError('Cannot select the same player twice')
        return v
    
    @validator('player_odds')
    def validate_three_odds(cls, v):
        if len(v) != 3:
            raise ValueError('Must provide odds for exactly 3 players')
        return v


# Nested schemas for tournament and player data
class TournamentInfo(BaseModel):
    id: int
    name: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    
    class Config:
        from_attributes = True

class PlayerInfo(BaseModel):
    id: int
    name: str
    country: Optional[str] = None
    
    class Config:
        from_attributes = True

class WeeklyLineupResponse(BaseModel):
    id: int
    team_id: int
    tournament_id: int
    player_1_id: int
    player_2_id: int
    player_3_id: int
    player_1_points: float
    player_2_points: float
    player_3_points: float
    total_points: float
    player_1_odds: Optional[float]
    player_2_odds: Optional[float]
    player_3_odds: Optional[float]
    is_locked: bool
    created_at: datetime
    
    # Nested relationship data
    tournament: Optional[TournamentInfo] = None
    player_1: Optional[PlayerInfo] = None
    player_2: Optional[PlayerInfo] = None
    player_3: Optional[PlayerInfo] = None

    class Config:
        from_attributes = True


# League membership and standings
class LeagueMembershipResponse(BaseModel):
    id: int
    user_id: int
    league_id: int
    total_points: float
    position: Optional[int]
    joined_at: datetime

    class Config:
        from_attributes = True


# Leaderboard specific response with team names
class LeaderboardEntryResponse(BaseModel):
    id: int
    user_id: int
    league_id: int
    total_points: float
    position: Optional[int]
    joined_at: datetime
    team_name: Optional[str] = None  # Team name from FantasyTeam
    username: Optional[str] = None   # Username from User

    class Config:
        from_attributes = True 