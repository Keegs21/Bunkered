import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Leaderboard,
  EmojiEvents,
  TrendingUp,
  SportsGolf,
  Star,
  Add,
  ExpandMore,
  PersonAdd,
  Settings,
  BarChart,
  PlaylistPlay,
  MonetizationOn,
  Close,
} from "@mui/icons-material";

interface League {
  id: number;
  name: string;
  description: string;
  status: "open" | "active" | "completed";
  season_year: number;
  entry_fee: number;
  max_members?: number;
  win_points: number;
  top_5_bonus: number;
  top_10_bonus: number;
  made_cut_bonus: number;
  odds_multiplier: number;
  created_by?: number;
}

interface LeagueStanding {
  id: number;
  user_id: number;
  league_id: number;
  total_points: number;
  position?: number;
  joined_at: string;
  team_name?: string;
  username?: string;
}

interface FantasyTeam {
  id: number;
  user_id: number;
  league_id: number;
  team_name: string;
  total_points: number;
  created_at: string;
}

interface WeeklyLineup {
  id: number;
  team_id: number;
  tournament_id: number;
  player_1_id: number;
  player_2_id: number;
  player_3_id: number;
  player_1_points: number;
  player_2_points: number;
  player_3_points: number;
  total_points: number;
  player_1_odds?: number;
  player_2_odds?: number;
  player_3_odds?: number;
  is_locked: boolean;
  created_at: string;
  tournament?: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
  };
  player_1?: {
    id: number;
    name: string;
  };
  player_2?: {
    id: number;
    name: string;
  };
  player_3?: {
    id: number;
    name: string;
  };
}

interface UpcomingTournament {
  id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  event_id: string;
  tour: string;
}

interface PlayerWithOdds {
  id: number;
  name: string;
  datagolf_player_id: string;
  country?: string;
  live_odds?: number;
  potential_points?: number;
  local_player_id?: number;
  local_tournament_id?: number;
}

interface CreateLeagueForm {
  name: string;
  description: string;
  season_year: number;
  entry_fee: number;
  max_members: string;
}

const Leagues: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Convert American odds to decimal odds for backend scoring system
  const americanToDecimalOdds = (americanOdds: number): number => {
    if (americanOdds > 0) {
      // Positive American odds: +200 becomes 3.0
      return americanOdds / 100 + 1;
    } else {
      // Negative American odds: -150 becomes 1.67
      return 100 / Math.abs(americanOdds) + 1;
    }
  };

  // Convert decimal odds back to American odds for display
  const decimalToAmericanOdds = (decimalOdds: number): string => {
    if (decimalOdds >= 2.0) {
      // Convert to positive American odds: 3.0 becomes +200
      const americanOdds = Math.round((decimalOdds - 1) * 100);
      return `+${americanOdds}`;
    } else {
      // Convert to negative American odds: 1.67 becomes -150
      const americanOdds = Math.round(-100 / (decimalOdds - 1));
      return `${americanOdds}`;
    }
  };
  const [leagues, setLeagues] = useState<League[]>([]);
  const [myTeams, setMyTeams] = useState<FantasyTeam[]>([]);
  const [standings, setStandings] = useState<{
    [leagueId: number]: LeagueStanding[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinTeamDialogOpen, setJoinTeamDialogOpen] = useState(false);
  const [teamDetailsDialogOpen, setTeamDetailsDialogOpen] = useState(false);
  const [lineupDialogOpen, setLineupDialogOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<FantasyTeam | null>(null);
  const [teamName, setTeamName] = useState("");
  const [weeklyLineups, setWeeklyLineups] = useState<WeeklyLineup[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<
    UpcomingTournament[]
  >([]);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerWithOdds[]>(
    []
  );
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  const [createForm, setCreateForm] = useState<CreateLeagueForm>({
    name: "",
    description: "",
    season_year: new Date().getFullYear(),
    entry_fee: 0,
    max_members: "",
  });

  const token = localStorage.getItem("token");

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/fantasy/leagues",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLeagues(data);
      }
    } catch (err) {
      setError("Failed to fetch leagues");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/fantasy/teams",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data);
      }
    } catch (err) {
      console.error("Failed to fetch teams");
    }
  };

  const fetchLeagueStandings = async (leagueId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/fantasy/leagues/${leagueId}/leaderboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStandings((prev) => ({
          ...prev,
          [leagueId]: data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch standings");
    }
  };

  const fetchTeamDetails = async (teamId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/fantasy/teams/${teamId}/lineups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWeeklyLineups(data);
      }
    } catch (err) {
      console.error("Failed to fetch team details");
      setError("Failed to fetch team details");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingTournaments = async () => {
    try {
      // Fetch upcoming tournaments from DataGolf schedule
      const response = await fetch(
        `http://localhost:8000/api/v1/tournaments/datagolf/schedule?tour=pga`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const currentDate = new Date();

        // Filter for upcoming tournaments (next 30 days)
        const upcoming =
          data.schedule?.filter((tournament: any) => {
            const startDate = new Date(tournament.start_date);
            const diffTime = startDate.getTime() - currentDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 30;
          }) || [];

        setUpcomingTournaments(upcoming.slice(0, 5)); // Get next 5 tournaments
      }
    } catch (err) {
      console.error("Failed to fetch upcoming tournaments");
    }
  };

  const fetchTournamentPlayersWithOdds = async (tournamentEventId: string) => {
    try {
      setLoading(true);

      // Get FanDuel-style odds with fantasy points projections
      const oddsResponse = await fetch(
        `http://localhost:8000/api/v1/tournaments/fanduel/tournament-odds/${tournamentEventId}?tour=pga`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (oddsResponse.ok) {
        const oddsData = await oddsResponse.json();

        if (
          oddsData.player_odds &&
          Array.isArray(oddsData.player_odds) &&
          oddsData.player_odds.length > 0
        ) {
          // Map FanDuel data to our player format
          const players: PlayerWithOdds[] = oddsData.player_odds.map(
            (player: any) => ({
              id:
                player.local_player_id ||
                player.dg_id ||
                Math.random() * 1000000,
              name: player.player_name || "Unknown Player",
              datagolf_player_id: player.dg_id?.toString() || "",
              country: player.country || "",
              live_odds: player.fanduel_win_odds || 50.0,
              potential_points: player.potential_fantasy_points || 0.0,
              local_player_id: player.local_player_id,
              local_tournament_id: player.local_tournament_id,
            })
          );

          setAvailablePlayers(players.slice(0, 100)); // Limit to top 100 for UI performance

          // Show data source info to user
          if (oddsData.data_source === "fanduel_datagolf") {
            setError(null); // Real FanDuel odds - no warning needed
          } else if (oddsData.data_source === "estimated") {
            setError(
              "Using estimated odds based on player rankings (FanDuel data unavailable)"
            );
          } else {
            setError("Using sample player data (limited data available)");
          }
        } else {
          // Fallback: try to get players from DataGolf directly
          await fetchPlayersDirectFromDataGolf();
        }
      } else {
        const errorData = await oddsResponse.json();
        // Fallback: try to get players from DataGolf directly
        await fetchPlayersDirectFromDataGolf();
      }
    } catch (err) {
      // Fallback: try to get players from DataGolf directly
      await fetchPlayersDirectFromDataGolf();
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersDirectFromDataGolf = async () => {
    try {
      // Get player rankings as fallback
      const rankingsResponse = await fetch(
        `http://localhost:8000/api/v1/tournaments/datagolf/rankings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rankingsResponse.ok) {
        const rankingsData = await rankingsResponse.json();

        if (Array.isArray(rankingsData) && rankingsData.length > 0) {
          // Map rankings to our player format with estimated odds
          const players: PlayerWithOdds[] = rankingsData
            .slice(0, 100)
            .map((player: any, index: number) => {
              // Simple odds calculation based on ranking position
              const estimatedOdds = 5.0 + index * 2.0;
              const estimatedPoints = Math.max(10, 200 - index * 3);

              return {
                id: player.dg_id || Math.random() * 1000000,
                name: player.player_name || "Unknown Player",
                datagolf_player_id: player.dg_id?.toString() || "",
                country: player.country || "",
                live_odds: estimatedOdds,
                potential_points: estimatedPoints,
              };
            });

          setAvailablePlayers(players);
          setError("Using fallback player data (rankings-based odds)");
        } else {
          console.log("No valid rankings data received");
          setError("No player data available for tournament selection");
          setAvailablePlayers([]);
        }
      } else {
        console.log("DataGolf rankings fallback also failed");
        setError("Unable to load player data - please try again later");
        setAvailablePlayers([]);
      }
    } catch (err) {
      console.error("DataGolf fallback failed:", err);
      setError("Unable to load player data - please try again later");
      setAvailablePlayers([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLeagues();
      fetchMyTeams();
      fetchUpcomingTournaments();
    }
  }, [token]);

  // Auto-load standings when leaderboards tab is selected
  useEffect(() => {
    if (tabValue === 2 && myTeams.length > 0) {
      // Load standings for all leagues the user is part of
      myTeams.forEach((team) => {
        fetchLeagueStandings(team.league_id);
      });
    }
  }, [tabValue, myTeams]);

  const handleCreateLeague = async () => {
    try {
      setLoading(true);
      const payload = {
        ...createForm,
        max_members: createForm.max_members
          ? parseInt(createForm.max_members)
          : null,
      };

      const response = await fetch(
        "http://localhost:8000/api/v1/fantasy/leagues",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setCreateDialogOpen(false);
        setCreateForm({
          name: "",
          description: "",
          season_year: new Date().getFullYear(),
          entry_fee: 0,
          max_members: "",
        });
        fetchLeagues();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to create league");
      }
    } catch (err) {
      setError("Failed to create league");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async (leagueId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/fantasy/leagues/${leagueId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSelectedLeague(leagues.find((l) => l.id === leagueId) || null);
        setJoinTeamDialogOpen(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to join league");
      }
    } catch (err) {
      setError("Failed to join league");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedLeague) return;

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/fantasy/teams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            league_id: selectedLeague.id,
            team_name: teamName || undefined,
          }),
        }
      );

      if (response.ok) {
        setJoinTeamDialogOpen(false);
        setTeamName("");
        setSelectedLeague(null);
        fetchMyTeams();
        fetchLeagues();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to create team");
      }
    } catch (err) {
      setError("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeamDetails = (team: FantasyTeam) => {
    setSelectedTeam(team);
    fetchTeamDetails(team.id);
    setTeamDetailsDialogOpen(true);
  };

  const handleSetLineup = (team: FantasyTeam) => {
    setSelectedTeam(team);
    setSelectedPlayers([]);
    setSelectedTournament("");
    setAvailablePlayers([]);
    setLineupDialogOpen(true);
  };

  const handleTournamentSelect = (tournamentEventId: string) => {
    setSelectedTournament(tournamentEventId);
    if (tournamentEventId) {
      fetchTournamentPlayersWithOdds(tournamentEventId);
    }
  };

  const handlePlayerToggle = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else if (selectedPlayers.length < 3) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSubmitLineup = async () => {
    if (!selectedTeam || selectedPlayers.length !== 3 || !selectedTournament) {
      setError("Please select a tournament and exactly 3 players");
      return;
    }

    try {
      setLoading(true);

      // Get the selected players' local database IDs and live odds
      const selectedPlayerObjects = availablePlayers.filter((p) =>
        selectedPlayers.includes(p.id)
      );
      const localPlayerIds = selectedPlayerObjects
        .map((p) => p.local_player_id)
        .filter((id) => id !== undefined);
      const localTournamentId = selectedPlayerObjects[0]?.local_tournament_id;

      // Get the live odds for each selected player at time of submission
      // Convert American odds to decimal odds for backend scoring system
      const playerOdds = selectedPlayerObjects.map((p) => {
        const americanOdds = p.live_odds || 100; // Default to +100 American odds if no odds available
        return americanToDecimalOdds(americanOdds);
      });

      // Make sure we have all local IDs and odds
      if (
        localPlayerIds.length !== 3 ||
        !localTournamentId ||
        playerOdds.length !== 3
      ) {
        setError("Player data not fully synced. Please try again.");
        return;
      }

      console.log("Submitting lineup with:", {
        tournament_id: localTournamentId,
        player_ids: localPlayerIds,
        player_odds: playerOdds,
      });

      const response = await fetch(
        `http://localhost:8000/api/v1/fantasy/teams/${selectedTeam.id}/lineups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tournament_id: localTournamentId,
            player_ids: localPlayerIds,
            player_odds: playerOdds,
          }),
        }
      );

      if (response.ok) {
        setLineupDialogOpen(false);
        setSelectedTeam(null);
        setSelectedPlayers([]);
        setSelectedTournament("");
        setAvailablePlayers([]);
        fetchMyTeams();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to set lineup");
      }
    } catch (err) {
      setError("Failed to set lineup");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "open":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <TrendingUp />;
      case "open":
        return <EmojiEvents />;
      case "completed":
        return <Star />;
      default:
        return <SportsGolf />;
    }
  };

  const isUserInLeague = (leagueId: number) => {
    return myTeams.some((team) => team.league_id === leagueId);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            <Leaderboard sx={{ mr: 2, fontSize: "inherit" }} />
            Fantasy Golf Leagues
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Join leagues, compete with friends, and track your standings
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create League
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="My Leagues" />
        <Tab label="Available Leagues" />
        <Tab label="Leaderboards" />
      </Tabs>

      {/* MY LEAGUES TAB */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Your Teams & Active Leagues
            </Typography>
          </Grid>
          {loading && <CircularProgress />}
          {myTeams.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <SportsGolf
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No teams yet
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Join a league and create your team to get started
                  </Typography>
                  <Button variant="outlined" onClick={() => setTabValue(1)}>
                    Browse Available Leagues
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
          {myTeams.map((team) => {
            const league = leagues.find((l) => l.id === team.league_id);
            return (
              <Grid item xs={12} md={6} key={team.id}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Box>
                        <Typography variant="h6">{team.team_name}</Typography>
                        <Typography color="text.secondary">
                          {league?.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={league?.status || "active"}
                        color={getStatusColor(league?.status || "active")}
                        icon={getStatusIcon(league?.status || "active")}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {team.total_points.toFixed(1)} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Season total points
                    </Typography>
                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        startIcon={<PlaylistPlay />}
                        onClick={() => handleSetLineup(team)}
                      >
                        Set Lineup
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<BarChart />}
                        onClick={() => handleViewTeamDetails(team)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* AVAILABLE LEAGUES TAB */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Available Leagues
            </Typography>
          </Grid>
          {loading && <CircularProgress />}
          {leagues.map((league) => (
            <Grid item xs={12} md={6} key={league.id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Box>
                      <Typography variant="h6">{league.name}</Typography>
                      <Typography color="text.secondary">
                        {league.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={league.status}
                      color={getStatusColor(league.status)}
                      icon={getStatusIcon(league.status)}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Season {league.season_year}
                  </Typography>

                  {league.entry_fee > 0 && (
                    <Typography variant="body2" gutterBottom>
                      Entry Fee: ${league.entry_fee}
                    </Typography>
                  )}

                  {/* Scoring Settings */}
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center">
                        <Settings sx={{ mr: 1, fontSize: "small" }} />
                        <Typography variant="body2">
                          Scoring Settings
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Win: {league.win_points} pts
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Top 5: {league.top_5_bonus} pts
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Top 10: {league.top_10_bonus} pts
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Made Cut: {league.made_cut_bonus} pts
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption">
                            Odds Multiplier: {league.odds_multiplier}x
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Box mt={2}>
                    {isUserInLeague(league.id) ? (
                      <Chip label="Already Joined" color="success" />
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => handleJoinLeague(league.id)}
                        disabled={loading || league.status === "completed"}
                      >
                        Join League
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* LEADERBOARDS TAB */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            League Standings
          </Typography>
          {myTeams.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Leaderboard
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No leagues joined
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Join a league to view standings and compete with others
                </Typography>
                <Button variant="outlined" onClick={() => setTabValue(1)}>
                  Browse Available Leagues
                </Button>
              </CardContent>
            </Card>
          ) : (
            myTeams.map((team) => {
              const league = leagues.find((l) => l.id === team.league_id);
              const leagueStandings = standings[team.league_id] || [];

              return (
                <Card key={team.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {league?.name} Standings
                    </Typography>
                    {loading ? (
                      <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress />
                      </Box>
                    ) : leagueStandings.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No standings available yet
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Rank</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell align="right">Total Points</TableCell>
                              <TableCell align="right">Joined</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {leagueStandings
                              .sort((a, b) => b.total_points - a.total_points)
                              .map((standing, index) => (
                                <TableRow
                                  key={standing.id}
                                  sx={{
                                    backgroundColor:
                                      standing.user_id === team.user_id
                                        ? "action.hover"
                                        : "inherit",
                                  }}
                                >
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      {index + 1 <= 3 && (
                                        <Avatar
                                          sx={{
                                            width: 24,
                                            height: 24,
                                            mr: 1,
                                            bgcolor:
                                              index + 1 === 1
                                                ? "gold"
                                                : index + 1 === 2
                                                ? "silver"
                                                : "#cd7f32",
                                            fontSize: "0.75rem",
                                          }}
                                        >
                                          {index + 1}
                                        </Avatar>
                                      )}
                                      {index + 1 > 3 && (
                                        <Typography
                                          variant="body2"
                                          sx={{ ml: 4 }}
                                        >
                                          {index + 1}
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={
                                          standing.user_id === team.user_id
                                            ? "bold"
                                            : "normal"
                                        }
                                      >
                                        {standing.team_name ||
                                          standing.username ||
                                          `User #${standing.user_id}`}
                                        {standing.user_id === team.user_id &&
                                          " (You)"}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {standing.total_points.toFixed(1)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        standing.joined_at
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      )}

      {/* CREATE LEAGUE DIALOG */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Fantasy League</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="League Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Season Year"
                value={createForm.season_year}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    season_year: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Entry Fee ($)"
                value={createForm.entry_fee}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    entry_fee: parseFloat(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Max Members (optional)"
                value={createForm.max_members}
                onChange={(e) =>
                  setCreateForm({ ...createForm, max_members: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Scoring System:</strong> This league will use our
                  advanced fantasy scoring system with logarithmic weighting
                  between betting odds and finishing position. Players who miss
                  the cut receive 0 points.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateLeague}
            disabled={loading}
          >
            Create League
          </Button>
        </DialogActions>
      </Dialog>

      {/* JOIN LEAGUE / CREATE TEAM DIALOG */}
      <Dialog
        open={joinTeamDialogOpen}
        onClose={() => setJoinTeamDialogOpen(false)}
      >
        <DialogTitle>Create Your Team</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            You've successfully joined <strong>{selectedLeague?.name}</strong>!
            Now create your team to start competing.
          </Typography>
          <TextField
            fullWidth
            label="Team Name (optional)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Leave blank to use your username"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinTeamDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTeam}
            disabled={loading}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* TEAM DETAILS DIALOG */}
      <Dialog
        open={teamDetailsDialogOpen}
        onClose={() => setTeamDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">
                {selectedTeam?.team_name} - Weekly Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Season Total: {selectedTeam?.total_points.toFixed(1)} points
              </Typography>
            </Box>
            <IconButton onClick={() => setTeamDetailsDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : weeklyLineups.length === 0 ? (
            <Alert severity="info">
              No lineups set yet. Start by setting your lineup for an upcoming
              tournament.
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Week-by-Week Performance
              </Typography>
              {weeklyLineups.map((lineup, index) => (
                <Card key={lineup.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Week {index + 1}:{" "}
                          {lineup.tournament?.name || "Tournament"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lineup.tournament?.start_date
                            ? new Date(
                                lineup.tournament.start_date
                              ).toLocaleDateString()
                            : "Date TBD"}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          {lineup.total_points.toFixed(1)} pts
                        </Typography>
                        {lineup.is_locked && (
                          <Chip label="Locked" color="warning" size="small" />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {lineup.player_1?.name || "Player 1"}
                          </Typography>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Odds:{" "}
                              {lineup.player_1_odds !== undefined
                                ? decimalToAmericanOdds(lineup.player_1_odds)
                                : "N/A"}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {lineup.player_1_points.toFixed(1)} pts
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {lineup.player_2?.name || "Player 2"}
                          </Typography>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Odds:{" "}
                              {lineup.player_2_odds !== undefined
                                ? decimalToAmericanOdds(lineup.player_2_odds)
                                : "N/A"}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {lineup.player_2_points.toFixed(1)} pts
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {lineup.player_3?.name || "Player 3"}
                          </Typography>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Odds:{" "}
                              {lineup.player_3_odds !== undefined
                                ? decimalToAmericanOdds(lineup.player_3_odds)
                                : "N/A"}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {lineup.player_3_points.toFixed(1)} pts
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ENHANCED LINEUP DIALOG */}
      <Dialog
        open={lineupDialogOpen}
        onClose={() => setLineupDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">
                Set Lineup - {selectedTeam?.team_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select 3 players for the upcoming tournament
              </Typography>
            </Box>
            <IconButton onClick={() => setLineupDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Tournament</InputLabel>
                <Select
                  value={selectedTournament}
                  onChange={(e) => handleTournamentSelect(e.target.value)}
                  label="Select Tournament"
                >
                  {upcomingTournaments.map((tournament) => (
                    <MenuItem
                      key={tournament.event_id}
                      value={tournament.event_id}
                    >
                      <Box>
                        <Typography variant="body2">
                          {tournament.event_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Selected Players ({selectedPlayers.length}/3)
                </Typography>
                {selectedPlayers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No players selected yet
                  </Typography>
                ) : (
                  availablePlayers
                    .filter((p) => selectedPlayers.includes(p.id))
                    .map((player) => (
                      <Card key={player.id} sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1 }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {player.country}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="body2" color="primary">
                                {player.potential_points} pts
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {player.live_odds !== undefined
                                  ? player.live_odds >= 0
                                    ? `+${player.live_odds}`
                                    : `${player.live_odds}`
                                  : "N/A"}{" "}
                                odds
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Available Players</Typography>
                <Box display="flex" alignItems="center">
                  <MonetizationOn sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Live odds & projected points
                  </Typography>
                </Box>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : !selectedTournament ? (
                <Alert severity="info">
                  Please select a tournament to view available players
                </Alert>
              ) : availablePlayers.length === 0 ? (
                <Alert severity="warning">
                  No player data available for this tournament
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {availablePlayers.map((player) => {
                    const isSelected = selectedPlayers.includes(player.id);
                    const canSelect = selectedPlayers.length < 3 || isSelected;

                    return (
                      <Card
                        key={player.id}
                        sx={{
                          mb: 1,
                          cursor: canSelect ? "pointer" : "not-allowed",
                          bgcolor: isSelected ? "action.selected" : "inherit",
                          opacity: canSelect ? 1 : 0.5,
                        }}
                        onClick={() =>
                          canSelect && handlePlayerToggle(player.id)
                        }
                      >
                        <CardContent sx={{ py: 1 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={1}>
                              <Checkbox
                                checked={isSelected}
                                disabled={!canSelect}
                                onChange={() =>
                                  canSelect && handlePlayerToggle(player.id)
                                }
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <Typography variant="body2" fontWeight="medium">
                                {player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {player.country || "Unknown"}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="body2" color="primary">
                                  {player.live_odds !== undefined
                                    ? player.live_odds >= 0
                                      ? `+${player.live_odds}`
                                      : `${player.live_odds}`
                                    : "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  American Odds
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="body2" color="secondary">
                                  {player.potential_points?.toFixed(1) || "0.0"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Projected Pts
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLineupDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitLineup}
            disabled={
              loading || selectedPlayers.length !== 3 || !selectedTournament
            }
          >
            Set Lineup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Leagues;
