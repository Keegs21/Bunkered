import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material";
import {
  EmojiEvents,
  Add,
  Person,
  Leaderboard,
  SportsCricket as SportsGolf,
  TrendingUp,
  AttachMoney,
  Star,
  Info,
  CalendarToday,
} from "@mui/icons-material";

// Types
interface League {
  id: number;
  name: string;
  season_year: number;
  description?: string;
  entry_fee: number;
  max_members?: number;
  status: "open" | "active" | "completed";
  win_points: number;
  top_5_bonus: number;
  top_10_bonus: number;
  made_cut_bonus: number;
  odds_multiplier: number;
  created_by?: number;
}

interface Player {
  id: number;
  name: string;
  country?: string;
  world_ranking?: number;
}

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_completed: boolean;
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
}

interface LeagueMembership {
  id: number;
  user_id: number;
  league_id: number;
  total_points: number;
  position?: number;
  joined_at: string;
  user?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

const Fantasy: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState(0);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myTeams, setMyTeams] = useState<FantasyTeam[]>([]);
  const [myLineups, setMyLineups] = useState<WeeklyLineup[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<FantasyTeam | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeagueMembership[]>([]);

  // Dialog states
  const [createLeagueOpen, setCreateLeagueOpen] = useState(false);
  const [registerTeamOpen, setRegisterTeamOpen] = useState(false);
  const [setLineupOpen, setSetLineupOpen] = useState(false);
  const [joinLeagueOpen, setJoinLeagueOpen] = useState(false);

  // Form states
  const [leagueForm, setLeagueForm] = useState({
    name: "",
    season_year: new Date().getFullYear(),
    description: "",
    entry_fee: 0,
    max_members: 12,
    win_points: 100,
    top_5_bonus: 50,
    top_10_bonus: 25,
    made_cut_bonus: 10,
    odds_multiplier: 1.0,
  });

  const [teamForm, setTeamForm] = useState({
    league_id: "",
    team_name: "",
  });

  const [lineupForm, setLineupForm] = useState({
    tournament_id: "",
    selected_players: [] as number[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    fetchLeagues();
    fetchTournaments();
    fetchPlayers();
    fetchMyTeams();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get("/api/v1/fantasy/leagues");
      setLeagues(response.data);
    } catch (err) {
      console.error("Error fetching leagues:", err);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await axios.get("/api/v1/tournaments");
      setTournaments(response.data);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get("/api/v1/players");
      setPlayers(response.data);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  const fetchMyTeams = async () => {
    try {
      const response = await axios.get("/api/v1/fantasy/teams");
      setMyTeams(response.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const fetchTeamLineups = async (teamId: number) => {
    try {
      const response = await axios.get(
        `/api/v1/fantasy/teams/${teamId}/lineups`
      );
      setMyLineups(response.data);
    } catch (err) {
      console.error("Error fetching lineups:", err);
    }
  };

  const fetchLeaderboard = async (leagueId: number) => {
    try {
      const response = await axios.get(
        `/api/v1/fantasy/leagues/${leagueId}/leaderboard`
      );
      setLeaderboard(response.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // Create League
  const handleCreateLeague = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/v1/fantasy/leagues", leagueForm);
      setCreateLeagueOpen(false);
      setLeagueForm({
        name: "",
        season_year: new Date().getFullYear(),
        description: "",
        entry_fee: 0,
        max_members: 12,
        win_points: 100,
        top_5_bonus: 50,
        top_10_bonus: 25,
        made_cut_bonus: 10,
        odds_multiplier: 1.0,
      });
      fetchLeagues();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create league");
    } finally {
      setLoading(false);
    }
  };

  // Join League
  const handleJoinLeague = async (leagueId: number) => {
    try {
      await axios.post(`/api/v1/fantasy/leagues/${leagueId}/join`);
      fetchLeagues();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to join league");
    }
  };

  // Register Team for League
  const handleRegisterTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/v1/fantasy/teams", teamForm);
      setRegisterTeamOpen(false);
      setTeamForm({
        league_id: "",
        team_name: "",
      });
      fetchMyTeams();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register team");
    } finally {
      setLoading(false);
    }
  };

  // Set Weekly Lineup
  const handleSetLineup = async () => {
    if (!selectedTeam || lineupForm.selected_players.length !== 3) {
      setError("Must select exactly 3 players");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/v1/fantasy/teams/${selectedTeam.id}/lineups`, {
        tournament_id: parseInt(lineupForm.tournament_id),
        player_ids: lineupForm.selected_players,
      });
      setSetLineupOpen(false);
      setLineupForm({
        tournament_id: "",
        selected_players: [],
      });
      if (selectedTeam) {
        fetchTeamLineups(selectedTeam.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to set lineup");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerToggle = (playerId: number) => {
    const currentSelected = lineupForm.selected_players;
    if (currentSelected.includes(playerId)) {
      setLineupForm({
        ...lineupForm,
        selected_players: currentSelected.filter((id) => id !== playerId),
      });
    } else if (currentSelected.length < 3) {
      setLineupForm({
        ...lineupForm,
        selected_players: [...currentSelected, playerId],
      });
    }
  };

  const renderLeagueCard = (league: League) => (
    <Card key={league.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h6" gutterBottom>
              <EmojiEvents sx={{ mr: 1, verticalAlign: "middle" }} />
              {league.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {league.description}
            </Typography>
            <Box display="flex" gap={1} mb={1}>
              <Chip
                label={`${league.season_year} Season`}
                size="small"
                color="primary"
              />
              <Chip
                label={`$${league.entry_fee} Entry`}
                size="small"
                color="secondary"
              />
              {league.max_members && (
                <Chip
                  label={`Max ${league.max_members} Members`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Win: {league.win_points}pts • Top 5: +{league.top_5_bonus}pts •
              Top 10: +{league.top_10_bonus}pts • Cut: +{league.made_cut_bonus}
              pts
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleJoinLeague(league.id)}
            >
              Join League
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedLeague(league);
                fetchLeaderboard(league.id);
              }}
            >
              View Leaderboard
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTeamCard = (team: FantasyTeam) => {
    const league = leagues.find((l) => l.id === team.league_id);

    return (
      <Card key={team.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                {team.team_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                League: {league?.name || "Unknown"}
              </Typography>
              <Typography variant="h6" color="primary">
                Season Total: {team.total_points} points
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedTeam(team);
                  setSetLineupOpen(true);
                }}
              >
                Set Weekly Lineup
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSelectedTeam(team);
                  fetchTeamLineups(team.id);
                }}
              >
                View Lineups
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderLineupCard = (lineup: WeeklyLineup) => {
    const tournament = tournaments.find((t) => t.id === lineup.tournament_id);
    const player1 = players.find((p) => p.id === lineup.player_1_id);
    const player2 = players.find((p) => p.id === lineup.player_2_id);
    const player3 = players.find((p) => p.id === lineup.player_3_id);

    return (
      <Card key={lineup.id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <CalendarToday sx={{ mr: 1, verticalAlign: "middle" }} />
            {tournament?.name || "Unknown Tournament"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Players:
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <span>{player1?.name || "Unknown"}</span>
                  <span>{lineup.player_1_points} pts</span>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <span>{player2?.name || "Unknown"}</span>
                  <span>{lineup.player_2_points} pts</span>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <span>{player3?.name || "Unknown"}</span>
                  <span>{lineup.player_3_points} pts</span>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary">
                Total: {lineup.total_points} points
              </Typography>
              {lineup.is_locked && (
                <Chip label="Locked" color="warning" size="small" />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant={isMobile ? "h5" : "h3"}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          <SportsGolf sx={{ mr: { xs: 1, sm: 2 }, fontSize: "inherit" }} />
          Fantasy Golf
        </Typography>

        <Typography
          variant={isMobile ? "body1" : "h6"}
          color="text.secondary"
          gutterBottom
          fontSize={isMobile ? "0.875rem" : "1.25rem"}
        >
          {isMobile
            ? "Season-long leagues with weekly lineups"
            : "Season-long leagues with weekly lineups"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Leagues" icon={<EmojiEvents />} />
        <Tab label="My Teams" icon={<Person />} />
        <Tab label="Scoring Info" icon={<Info />} />
      </Tabs>

      {/* LEAGUES TAB */}
      {tabValue === 0 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5">Available Leagues</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateLeagueOpen(true)}
            >
              Create League
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              {leagues.map(renderLeagueCard)}
              {leagues.length === 0 && (
                <Alert severity="info">
                  No leagues available. Create one to get started!
                </Alert>
              )}
            </Grid>
          </Grid>

          {selectedLeague && leaderboard.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                {selectedLeague.name} Leaderboard
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell>Player</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {member.user?.username || "Unknown"}
                        </TableCell>
                        <TableCell align="right">
                          {member.total_points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}

      {/* MY TEAMS TAB */}
      {tabValue === 1 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5">My Teams</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setRegisterTeamOpen(true)}
            >
              Register New Team
            </Button>
          </Box>

          {myTeams.map(renderTeamCard)}
          {myTeams.length === 0 && (
            <Alert severity="info">
              No teams yet. Join a league and register a team to get started!
            </Alert>
          )}

          {/* Show lineups for selected team */}
          {selectedTeam && myLineups.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                {selectedTeam.team_name} - Weekly Lineups
              </Typography>
              {myLineups.map(renderLineupCard)}
            </Box>
          )}
        </Box>
      )}

      {/* SCORING INFO TAB */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
            Scoring System
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Star sx={{ mr: 1, verticalAlign: "middle" }} />
                    How It Works
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Season-Long Competition:</strong> Join leagues that
                    last the entire PGA season.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Weekly Lineups:</strong> Each week, pick 3 golfers
                    for the tournament.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Points Accumulate:</strong> Your season total is the
                    sum of all weekly scores.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AttachMoney sx={{ mr: 1, verticalAlign: "middle" }} />
                    Scoring Formula
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>
                      (Position Points + Bonus Points) × Odds Multiplier
                    </strong>
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" paragraph>
                    <strong>Position Points:</strong> Based on finish (winner
                    gets most points)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Bonus Points:</strong> Win (+100), Top 5 (+50), Top
                    10 (+25), Made Cut (+10)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Odds Multiplier:</strong> Longer pre-tournament odds
                    = higher multiplier
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Example Scenarios
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Scenario</TableCell>
                          <TableCell>Position</TableCell>
                          <TableCell>Odds</TableCell>
                          <TableCell align="right">Est. Points</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Tournament winner (favorite)</TableCell>
                          <TableCell>1st</TableCell>
                          <TableCell>8/1</TableCell>
                          <TableCell align="right">~424 pts</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tournament winner (longshot)</TableCell>
                          <TableCell>1st</TableCell>
                          <TableCell>80/1</TableCell>
                          <TableCell align="right">~610 pts</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>3rd place finish</TableCell>
                          <TableCell>3rd</TableCell>
                          <TableCell>25/1</TableCell>
                          <TableCell align="right">~186 pts</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Made cut, poor finish</TableCell>
                          <TableCell>45th</TableCell>
                          <TableCell>150/1</TableCell>
                          <TableCell align="right">~48 pts</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Missed cut</TableCell>
                          <TableCell>MC</TableCell>
                          <TableCell>Any</TableCell>
                          <TableCell align="right">0 pts</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* CREATE LEAGUE DIALOG */}
      <Dialog
        open={createLeagueOpen}
        onClose={() => setCreateLeagueOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New League</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="League Name"
            fullWidth
            variant="outlined"
            value={leagueForm.name}
            onChange={(e) =>
              setLeagueForm({ ...leagueForm, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={leagueForm.description}
            onChange={(e) =>
              setLeagueForm({ ...leagueForm, description: e.target.value })
            }
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Entry Fee"
                type="number"
                fullWidth
                variant="outlined"
                value={leagueForm.entry_fee}
                onChange={(e) =>
                  setLeagueForm({
                    ...leagueForm,
                    entry_fee: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Members"
                type="number"
                fullWidth
                variant="outlined"
                value={leagueForm.max_members}
                onChange={(e) =>
                  setLeagueForm({
                    ...leagueForm,
                    max_members: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateLeagueOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateLeague}
            variant="contained"
            disabled={loading || !leagueForm.name}
          >
            Create League
          </Button>
        </DialogActions>
      </Dialog>

      {/* REGISTER TEAM DIALOG */}
      <Dialog
        open={registerTeamOpen}
        onClose={() => setRegisterTeamOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register Team for League</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Select League</InputLabel>
            <Select
              value={teamForm.league_id}
              label="Select League"
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  league_id: e.target.value as string,
                })
              }
            >
              {leagues.map((league) => (
                <MenuItem key={league.id} value={league.id}>
                  {league.name} ({league.season_year})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={teamForm.team_name}
            onChange={(e) =>
              setTeamForm({ ...teamForm, team_name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterTeamOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRegisterTeam}
            variant="contained"
            disabled={loading || !teamForm.league_id}
          >
            Register Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* SET LINEUP DIALOG */}
      <Dialog
        open={setLineupOpen}
        onClose={() => setSetLineupOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Set Weekly Lineup</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Select Tournament</InputLabel>
            <Select
              value={lineupForm.tournament_id}
              label="Select Tournament"
              onChange={(e) =>
                setLineupForm({
                  ...lineupForm,
                  tournament_id: e.target.value as string,
                })
              }
            >
              {tournaments
                .filter((t) => !t.is_completed)
                .map((tournament) => (
                  <MenuItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Select 3 Players ({lineupForm.selected_players.length}/3)
          </Typography>

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {players.map((player) => (
              <ListItem key={player.id} dense>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={lineupForm.selected_players.includes(player.id)}
                      onChange={() => handlePlayerToggle(player.id)}
                      disabled={
                        !lineupForm.selected_players.includes(player.id) &&
                        lineupForm.selected_players.length >= 3
                      }
                    />
                  }
                  label={`${player.name} ${
                    player.country ? `(${player.country})` : ""
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetLineupOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSetLineup}
            variant="contained"
            disabled={
              loading ||
              lineupForm.selected_players.length !== 3 ||
              !lineupForm.tournament_id
            }
          >
            Set Lineup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Fantasy;
