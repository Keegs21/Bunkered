from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database.database import Base


class BetStatus(enum.Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"
    PUSHED = "pushed"


class FantasyPoolStatus(enum.Enum):
    OPEN = "open"
    ACTIVE = "active"
    COMPLETED = "completed"


class FantasyLeagueStatus(enum.Enum):
    OPEN = "open"
    ACTIVE = "active"
    COMPLETED = "completed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    referral_code_id = Column(Integer, ForeignKey("referral_codes.id"), nullable=True)  # Which referral code was used to register
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bets = relationship("Bet", back_populates="user")
    fantasy_entries = relationship("FantasyEntry", back_populates="user")
    fantasy_teams = relationship("FantasyTeam", back_populates="user")
    league_memberships = relationship("LeagueMembership", back_populates="user")


class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    course_name = Column(String)
    purse = Column(Float)
    datagolf_tournament_id = Column(String)
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bets = relationship("Bet", back_populates="tournament")
    fantasy_pools = relationship("FantasyPool", back_populates="tournament")
    tournament_results = relationship("TournamentResult", back_populates="tournament")
    player_odds = relationship("PlayerOdds", back_populates="tournament")
    weekly_lineups = relationship("WeeklyLineup", back_populates="tournament")


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    datagolf_player_id = Column(String, unique=True)
    country = Column(String)
    world_ranking = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bets = relationship("Bet", back_populates="player")
    fantasy_entries = relationship("FantasyEntry", back_populates="player")
    tournament_results = relationship("TournamentResult", back_populates="player")
    player_odds = relationship("PlayerOdds", back_populates="player")


class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    bet_type = Column(String, nullable=False)  # "outright", "top_5", "top_10", "head_to_head", etc.
    amount = Column(Float, nullable=False)
    odds = Column(Float)
    potential_payout = Column(Float)
    status = Column(Enum(BetStatus), default=BetStatus.PENDING)
    placed_at = Column(DateTime(timezone=True), server_default=func.now())
    settled_at = Column(DateTime(timezone=True))
    description = Column(Text)

    # Relationships
    user = relationship("User", back_populates="bets")
    tournament = relationship("Tournament", back_populates="bets")
    player = relationship("Player", back_populates="bets")


class FantasyLeague(Base):
    __tablename__ = "fantasy_leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    season_year = Column(Integer, nullable=False)
    entry_fee = Column(Float, default=0.0)
    max_members = Column(Integer)
    status = Column(Enum(FantasyLeagueStatus), default=FantasyLeagueStatus.OPEN)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text)
    
    # Scoring settings
    win_points = Column(Float, default=100.0)
    top_5_bonus = Column(Float, default=50.0)
    top_10_bonus = Column(Float, default=25.0)
    made_cut_bonus = Column(Float, default=10.0)
    odds_multiplier = Column(Float, default=1.0)  # How much to weight odds in scoring

    # Relationships
    memberships = relationship("LeagueMembership", back_populates="league")
    pools = relationship("FantasyPool", back_populates="league")


class LeagueMembership(Base):
    __tablename__ = "league_memberships"

    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey("fantasy_leagues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_points = Column(Float, default=0.0)
    position = Column(Integer)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    league = relationship("FantasyLeague", back_populates="memberships")
    user = relationship("User", back_populates="league_memberships")

    __table_args__ = (UniqueConstraint('league_id', 'user_id', name='_league_user_uc'),)


class FantasyPool(Base):
    __tablename__ = "fantasy_pools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("fantasy_leagues.id"))  # Optional: can be standalone
    entry_fee = Column(Float, default=0.0)
    max_entries = Column(Integer)
    status = Column(Enum(FantasyPoolStatus), default=FantasyPoolStatus.OPEN)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    start_date = Column(DateTime(timezone=True))

    # Relationships
    tournament = relationship("Tournament", back_populates="fantasy_pools")
    league = relationship("FantasyLeague", back_populates="pools")
    entries = relationship("FantasyEntry", back_populates="pool")


class FantasyTeam(Base):
    __tablename__ = "fantasy_teams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("fantasy_leagues.id"), nullable=False)
    team_name = Column(String)
    total_points = Column(Float, default=0.0)  # Season total
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="fantasy_teams")
    weekly_lineups = relationship("WeeklyLineup", back_populates="team")

    __table_args__ = (UniqueConstraint('user_id', 'league_id', name='_user_league_team_uc'),)


class WeeklyLineup(Base):
    __tablename__ = "weekly_lineups"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("fantasy_teams.id"), nullable=False)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player_1_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    player_2_id = Column(Integer, ForeignKey("players.id"), nullable=False) 
    player_3_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    
    # Points and odds for each player
    player_1_points = Column(Float, default=0.0)
    player_2_points = Column(Float, default=0.0)
    player_3_points = Column(Float, default=0.0)
    total_points = Column(Float, default=0.0)  # Sum of all 3 players
    
    player_1_odds = Column(Float)  # Pre-tournament odds when lineup was set
    player_2_odds = Column(Float)
    player_3_odds = Column(Float)
    
    is_locked = Column(Boolean, default=False)  # True after tournament starts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team = relationship("FantasyTeam", back_populates="weekly_lineups")
    tournament = relationship("Tournament", back_populates="weekly_lineups")
    player_1 = relationship("Player", foreign_keys=[player_1_id])
    player_2 = relationship("Player", foreign_keys=[player_2_id])
    player_3 = relationship("Player", foreign_keys=[player_3_id])

    __table_args__ = (UniqueConstraint('team_id', 'tournament_id', name='_team_tournament_lineup_uc'),)


class TournamentResult(Base):
    __tablename__ = "tournament_results"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    position = Column(Integer)  # Final position (1st, 2nd, etc.)
    score = Column(Integer)  # Total score relative to par
    prize_money = Column(Float)
    made_cut = Column(Boolean, default=False)
    rounds_played = Column(Integer, default=0)
    
    # Additional scoring details
    round_1_score = Column(Integer)
    round_2_score = Column(Integer)
    round_3_score = Column(Integer)
    round_4_score = Column(Integer)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="tournament_results")
    player = relationship("Player", back_populates="tournament_results")

    __table_args__ = (UniqueConstraint('tournament_id', 'player_id', name='_tournament_player_result_uc'),)


class PlayerOdds(Base):
    __tablename__ = "player_odds"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    outright_odds = Column(Float)  # Decimal odds to win tournament
    top_5_odds = Column(Float)
    top_10_odds = Column(Float)
    make_cut_odds = Column(Float)
    odds_source = Column(String)  # Which sportsbook/API
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tournament = relationship("Tournament", back_populates="player_odds")
    player = relationship("Player", back_populates="player_odds")


# Keep the old FantasyEntry for backward compatibility, but it's now deprecated
class FantasyEntry(Base):
    __tablename__ = "fantasy_entries"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer, ForeignKey("fantasy_pools.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    entry_name = Column(String)
    total_score = Column(Float, default=0.0)
    position = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    pool = relationship("FantasyPool", back_populates="entries")
    user = relationship("User", back_populates="fantasy_entries")
    player = relationship("Player", back_populates="fantasy_entries")


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    content = Column(Text)
    url = Column(String)
    author = Column(String)
    source = Column(String)
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    category = Column(String)  # "tournament", "player", "general"


class ReferralCode(Base):
    __tablename__ = "referral_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))  # Admin who created the code
    is_active = Column(Boolean, default=True)
    max_uses = Column(Integer, default=1)  # How many times this code can be used
    current_uses = Column(Integer, default=0)  # How many times it has been used
    expires_at = Column(DateTime(timezone=True))  # Optional expiration date
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String)  # Optional description for tracking

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class PlayerStats(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    year = Column(Integer)
    driving_distance = Column(Float)
    driving_accuracy = Column(Float)
    greens_in_regulation = Column(Float)
    putting_average = Column(Float)
    scoring_average = Column(Float)
    world_ranking = Column(Integer)
    form_rank = Column(Integer)
    strokes_gained_total = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 