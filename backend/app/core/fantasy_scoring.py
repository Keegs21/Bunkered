"""
Fantasy Golf Scoring System

This module calculates fantasy points using a sophisticated logarithmic algorithm that:
1. Weights betting odds at lineup submission time against final finishing position
2. Rewards high-risk, high-reward picks with longer odds
3. Uses logarithmic scaling for both odds multipliers and position scoring
4. Provides meaningful differentiation across all finishing positions

Scoring Formula:
Base Points = (Position Score × Odds Multiplier) + Achievement Bonuses

Where:
- Position Score: Logarithmic scoring based on finish position
- Odds Multiplier: Logarithmic scaling based on pre-tournament odds
- Achievement Bonuses: Fixed bonuses for wins, top finishes, and making cut
"""

from typing import Optional, Dict, List, Tuple
import math
from sqlalchemy.orm import Session
from app.database import models


class FantasyScoring:
    """Advanced fantasy golf scoring calculator with logarithmic weighting"""
    
    def __init__(self, league: models.FantasyLeague):
        """Initialize with league scoring settings"""
        self.league = league
        
        # Scoring configuration - use getattr to safely access model attributes
        self.win_bonus = getattr(league, 'win_points', None) or 150.0
        self.top_5_bonus = getattr(league, 'top_5_bonus', None) or 75.0
        self.top_10_bonus = getattr(league, 'top_10_bonus', None) or 40.0
        self.made_cut_bonus = getattr(league, 'made_cut_bonus', None) or 15.0
        
        # Odds weighting (0.0 = ignore odds, 1.0 = full odds weighting)
        self.odds_weight = getattr(league, 'odds_multiplier', None) or 0.7
        
        # Position scoring parameters
        self.max_position_points = 200.0  # Maximum points for 1st place
        self.min_position_points = 5.0    # Minimum points for last place
        
        # Odds multiplier parameters
        self.max_odds_multiplier = 3.5    # Maximum multiplier for extreme longshots
        self.min_odds_multiplier = 0.8    # Minimum multiplier for heavy favorites
    
    def calculate_position_score(self, position: Optional[int], field_size: int = 156) -> float:
        """
        Calculate logarithmic position score
        
        Uses logarithmic decay to reward higher finishes while still giving
        meaningful points to all positions that made the cut.
        
        Args:
            position: Final tournament position (1=winner, 2=2nd, etc.)
            field_size: Total tournament field size
            
        Returns:
            Position score (higher = better finish)
        """
        if position is None or position <= 0:
            return 0.0
        
        # Ensure position doesn't exceed field size
        position = min(position, field_size)
        
        # Logarithmic scoring that rewards top finishes heavily
        # but still provides meaningful differentiation throughout field
        position_ratio = (field_size - position + 1) / field_size
        
        # Use natural log for smooth curve with emphasis on top positions
        log_score = math.log(1 + position_ratio * (math.e - 1))
        
        # Scale to our point range
        scaled_score = self.min_position_points + (
            (self.max_position_points - self.min_position_points) * log_score
        )
        
        return round(scaled_score, 2)
    
    def calculate_odds_multiplier(self, pre_tournament_odds: Optional[float]) -> float:
        """
        Calculate logarithmic odds multiplier
        
        Longer odds provide higher multipliers to reward risk-taking,
        but the scaling is logarithmic to prevent extreme imbalances.
        
        Args:
            pre_tournament_odds: Decimal odds when lineup was submitted
            
        Returns:
            Multiplier to apply to base score
        """
        if pre_tournament_odds is None or pre_tournament_odds <= 1.0:
            return 1.0
        
        # Logarithmic odds scaling
        # +200 (3.0) = ~1.0x multiplier (no bonus for moderate favorites)
        # +500 (6.0) = ~1.3x multiplier
        # +1500 (16.0) = ~1.8x multiplier  
        # +5000 (51.0) = ~2.5x multiplier
        # +15000 (151.0) = ~3.2x multiplier
        
        # Natural log scaling with adjustment for golf odds range
        log_multiplier = 1.0 + (math.log(pre_tournament_odds / 3.0) * 0.4)
        
        # Clamp to reasonable bounds
        odds_multiplier = max(
            self.min_odds_multiplier,
            min(self.max_odds_multiplier, log_multiplier)
        )
        
        # Apply league's odds weighting preference
        final_multiplier = 1.0 + ((odds_multiplier - 1.0) * self.odds_weight)
        
        return round(final_multiplier, 3)
    
    def calculate_achievement_bonuses(self, position: Optional[int], made_cut: bool) -> float:
        """
        Calculate fixed bonuses for specific achievements
        
        Args:
            position: Final tournament position
            made_cut: Whether player made the cut
            
        Returns:
            Total achievement bonus points
        """
        if position is None:
            return 0.0
        
        bonus = 0.0
        
        # Win bonus (most prestigious)
        if position == 1:
            bonus += self.win_bonus
        
        # Top 5 bonus (elite finish)  
        if position <= 5:
            bonus += self.top_5_bonus
        
        # Top 10 bonus (excellent finish)
        if position <= 10:
            bonus += self.top_10_bonus
        
        # Made cut bonus (basic achievement)
        if made_cut:
            bonus += self.made_cut_bonus
        
        return bonus
    
    def calculate_player_score(
        self,
        position: Optional[int],
        made_cut: bool,
        pre_tournament_odds: Optional[float],
        field_size: int = 156
    ) -> Dict[str, float]:
        """
        Calculate comprehensive player score with breakdown
        
        Args:
            position: Final tournament position
            made_cut: Whether player made the cut
            pre_tournament_odds: Odds when lineup was submitted
            field_size: Tournament field size
            
        Returns:
            Dictionary with score breakdown and total
        """
        # CRITICAL: Players who miss the cut get 0 points regardless of any other factors
        if not made_cut:
            return {
                'position_score': 0.0,
                'odds_multiplier': 1.0,
                'achievement_bonus': 0.0,
                'base_score': 0.0,
                'total_score': 0.0
            }
        
        # Core position score
        position_score = self.calculate_position_score(position, field_size)
        
        # Odds-based multiplier
        odds_multiplier = self.calculate_odds_multiplier(pre_tournament_odds)
        
        # Achievement bonuses
        achievement_bonus = self.calculate_achievement_bonuses(position, made_cut)
        
        # Final calculation: (Position Score × Odds Multiplier) + Achievement Bonuses
        base_score = position_score * odds_multiplier
        total_score = base_score + achievement_bonus
        
        return {
            'position_score': position_score,
            'odds_multiplier': odds_multiplier,
            'achievement_bonus': achievement_bonus,
            'base_score': base_score,
            'total_score': round(total_score, 2)
        }
    
    def calculate_lineup_score(self, lineup: models.WeeklyLineup, db: Session) -> Dict[str, any]:
        """
        Calculate total score for a 3-player weekly lineup
        
        Args:
            lineup: WeeklyLineup model instance
            db: Database session
            
        Returns:
            Dictionary with player scores and total
        """
        player_scores = []
        total_points = 0.0
        
        # Get tournament info for field size
        tournament = db.query(models.Tournament).filter(
            models.Tournament.id == lineup.tournament_id
        ).first()
        
        field_size = 156  # Default PGA field size
        if tournament:
            # Could add field_size to Tournament model if needed
            pass
        
        # Score each player in the lineup
        players_data = [
            (lineup.player_1_id, lineup.player_1_odds),
            (lineup.player_2_id, lineup.player_2_odds), 
            (lineup.player_3_id, lineup.player_3_odds)
        ]
        
        for i, (player_id, player_odds) in enumerate(players_data, 1):
            # Get tournament result for this player
            result = db.query(models.TournamentResult).filter(
                models.TournamentResult.tournament_id == lineup.tournament_id,
                models.TournamentResult.player_id == player_id
            ).first()
            
            # Get player info
            player = db.query(models.Player).filter(
                models.Player.id == player_id
            ).first()
            
            # Calculate score
            if result:
                # Extract actual values from the model instance
                position = getattr(result, 'position', None)
                made_cut = getattr(result, 'made_cut', False)
                score_breakdown = self.calculate_player_score(
                    position=position,
                    made_cut=made_cut,
                    pre_tournament_odds=player_odds,
                    field_size=field_size
                )
                player_score = score_breakdown['total_score']
            else:
                # No result = 0 points
                score_breakdown = self.calculate_player_score(None, False, player_odds)
                player_score = 0.0
            
            player_scores.append({
                'player_id': player_id,
                'player_name': player.name if player else f"Player {player_id}",
                'position': result.position if result else None,
                'made_cut': result.made_cut if result else False,
                'pre_tournament_odds': player_odds,
                'score_breakdown': score_breakdown,
                'points': player_score
            })
            
            total_points += player_score
            
            # Update individual player score in lineup
            if i == 1:
                lineup.player_1_points = player_score
            elif i == 2:
                lineup.player_2_points = player_score
            elif i == 3:
                lineup.player_3_points = player_score
        
        # Update total score
        lineup.total_points = round(total_points, 2)
        
        return {
            'lineup_id': lineup.id,
            'tournament_id': lineup.tournament_id,
            'player_scores': player_scores,
            'total_points': round(total_points, 2)
        }


def update_weekly_lineup_scores(tournament_id: int, db: Session) -> List[Dict]:
    """
    Update all weekly lineup scores for a completed tournament
    
    Args:
        tournament_id: Tournament to update scores for
        db: Database session
        
    Returns:
        List of updated lineup score summaries
    """
    updated_lineups = []
    
    # Get all weekly lineups for this tournament
    lineups = db.query(models.WeeklyLineup).filter(
        models.WeeklyLineup.tournament_id == tournament_id
    ).all()
    
    for lineup in lineups:
        # Get the team's league for scoring settings
        team = db.query(models.FantasyTeam).filter(
            models.FantasyTeam.id == lineup.team_id
        ).first()
        
        if not team:
            continue
            
        league = db.query(models.FantasyLeague).filter(
            models.FantasyLeague.id == team.league_id
        ).first()
        
        if not league:
            continue
        
        # Calculate lineup score
        scorer = FantasyScoring(league)
        lineup_result = scorer.calculate_lineup_score(lineup, db)
        
        updated_lineups.append({
            'lineup_id': lineup.id,
            'team_id': lineup.team_id,
            'user_id': team.user_id,
            'total_points': lineup_result['total_points']
        })
    
    # Update season totals for all teams
    teams_updated = set()
    for lineup in lineups:
        team = db.query(models.FantasyTeam).filter(
            models.FantasyTeam.id == lineup.team_id
        ).first()
        
        if team and team.id not in teams_updated:
            update_team_season_total(team.id, db)
            teams_updated.add(team.id)
    
    # Update league standings
    leagues_updated = set()
    for lineup in lineups:
        team = db.query(models.FantasyTeam).filter(
            models.FantasyTeam.id == lineup.team_id
        ).first()
        
        if team and team.league_id not in leagues_updated:
            update_league_standings(team.league_id, db)
            leagues_updated.add(team.league_id)
    
    db.commit()
    return updated_lineups


def update_team_season_total(team_id: int, db: Session) -> float:
    """
    Recalculate and update a team's season total from all weekly lineups
    
    Args:
        team_id: Team to update
        db: Database session
        
    Returns:
        New season total points
    """
    team = db.query(models.FantasyTeam).filter(
        models.FantasyTeam.id == team_id
    ).first()
    
    if not team:
        return 0.0
    
    # Sum all weekly lineup points
    from sqlalchemy import func
    season_total = db.query(
        func.sum(models.WeeklyLineup.total_points)
    ).filter(
        models.WeeklyLineup.team_id == team_id
    ).scalar() or 0.0
    
    # Update team total
    team.total_points = float(season_total)
    
    # Update league membership total
    membership = db.query(models.LeagueMembership).filter(
        models.LeagueMembership.league_id == team.league_id,
        models.LeagueMembership.user_id == team.user_id
    ).first()
    
    if membership:
        membership.total_points = float(season_total)
    
    return float(season_total)


def update_league_standings(league_id: int, db: Session) -> None:
    """
    Update position rankings for all members in a fantasy league
    
    Args:
        league_id: League to update standings for
        db: Database session
    """
    memberships = db.query(models.LeagueMembership).filter(
        models.LeagueMembership.league_id == league_id
    ).order_by(models.LeagueMembership.total_points.desc()).all()
    
    for position, membership in enumerate(memberships, 1):
        membership.position = position
    
    db.commit()


def calculate_single_player_score(
    db: Session,
    tournament_id: int,
    player_id: int, 
    pre_tournament_odds: Optional[float],
    league_id: Optional[int] = None
) -> Dict[str, any]:
    """
    Calculate fantasy score for a single player performance
    
    Args:
        db: Database session
        tournament_id: Tournament ID
        player_id: Player ID
        pre_tournament_odds: Odds when pick was made
        league_id: League ID for scoring settings (optional)
        
    Returns:
        Score breakdown dictionary
    """
    # Get tournament result
    result = db.query(models.TournamentResult).filter(
        models.TournamentResult.tournament_id == tournament_id,
        models.TournamentResult.player_id == player_id
    ).first()
    
    # Get league for scoring settings
    if league_id:
        league = db.query(models.FantasyLeague).filter(
            models.FantasyLeague.id == league_id
        ).first()
    else:
        # Create default league settings
        league = models.FantasyLeague(
            name="Default",
            season_year=2024,
            win_points=150.0,
            top_5_bonus=75.0,
            top_10_bonus=40.0,
            made_cut_bonus=15.0,
            odds_multiplier=0.7
        )
    
    scorer = FantasyScoring(league)
    
    if result:
        return scorer.calculate_player_score(
            position=result.position,
            made_cut=result.made_cut,
            pre_tournament_odds=pre_tournament_odds
        )
    else:
        return scorer.calculate_player_score(None, False, pre_tournament_odds)


def get_scoring_examples() -> Dict[str, Dict]:
    """
    Generate example scores for different scenarios to illustrate the system
    
    Returns:
        Dictionary of scoring examples with explanations
    """
    # Create example league with default settings
    example_league = models.FantasyLeague(
        name="Example League",
        season_year=2024,
        win_points=150.0,
        top_5_bonus=75.0,
        top_10_bonus=40.0,
        made_cut_bonus=15.0,
        odds_multiplier=0.7  # 70% odds weighting
    )
    
    scorer = FantasyScoring(example_league)
    
    scenarios = {
        "favorite_wins": {
            "position": 1,
            "made_cut": True,
            "odds": 8.0,  # +700 favorite
            "description": "Tournament winner who was a favorite"
        },
        "longshot_wins": {
            "position": 1, 
            "made_cut": True,
            "odds": 80.0,  # +7900 longshot
            "description": "Tournament winner who was a longshot - huge bonus!"
        },
        "longshot_top5": {
            "position": 3,
            "made_cut": True,
            "odds": 75.0,  # +7400 longshot
            "description": "Longshot with top 5 finish - excellent value"
        },
        "favorite_top5": {
            "position": 4,
            "made_cut": True,
            "odds": 12.0,  # +1100 favorite
            "description": "Favorite with top 5 finish - solid but expected"
        },
        "mid_range_top10": {
            "position": 8,
            "made_cut": True,
            "odds": 35.0,  # +3400 mid-range
            "description": "Mid-range player with top 10 - good value"
        },
        "longshot_made_cut": {
            "position": 35,
            "made_cut": True,
            "odds": 150.0,  # +14900 extreme longshot
            "description": "Extreme longshot makes cut - decent points due to odds"
        },
        "favorite_poor_finish": {
            "position": 45,
            "made_cut": True,
            "odds": 6.0,  # +500 favorite
            "description": "Favorite with poor finish - minimal points"
        },
        "missed_cut": {
            "position": None,
            "made_cut": False,
            "odds": 25.0,  # +2400
            "description": "Missed cut - zero points regardless of odds"
        }
    }
    
    results = {}
    for scenario_name, scenario in scenarios.items():
        score_breakdown = scorer.calculate_player_score(
            position=scenario["position"],
            made_cut=scenario["made_cut"],
            pre_tournament_odds=scenario["odds"]
        )
        
        results[scenario_name] = {
            **scenario,
            **score_breakdown,
            "analysis": f"Odds: +{int((scenario['odds']-1)*100)}, "
                       f"Total: {score_breakdown['total_score']} pts"
        }
    
    return results 