import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  SportsGolf,
  AttachMoney,
  EmojiEvents,
  Refresh,
  Leaderboard,
  Assessment,
  Star,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  PlayArrow,
  Timeline,
  ShowChart,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBettingStats } from "../hooks/useBettingStats";

// Simplified interfaces matching what the API actually returns
interface TeamStanding {
  id: number;
  league_name: string;
  team_name: string;
  current_rank: number;
  total_teams: number;
  points: number;
  status: "leading" | "top3" | "mid" | "bottom";
  trend: "up" | "down" | "stable";
  league_id: number;
}

interface QuickAction {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  color: "primary" | "secondary" | "success" | "info";
  buttonText: string;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user } = useAuth();
  const navigate = useNavigate();
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    stats: bettingStats,
    loading: statsLoading,
    error: statsError,
    refreshStats,
  } = useBettingStats();

  // Use token directly like Leagues page does
  const token = localStorage.getItem("token");

  // Simplified data fetching like Leagues page
  const fetchMyTeams = async () => {
    try {
      const response = await fetch("/api/v1/fantasy/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
    return [];
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch("/api/v1/fantasy/leagues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch leagues:", err);
    }
    return [];
  };

  const fetchLeagueStandings = async (leagueId: number) => {
    try {
      const response = await fetch(
        `/api/v1/fantasy/leagues/${leagueId}/leaderboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch standings:", err);
    }
    return [];
  };

  const getTeamStatus = (
    rank: number,
    totalTeams: number
  ): TeamStanding["status"] => {
    if (rank === 1) return "leading";
    if (rank <= 3) return "top3";
    if (rank <= totalTeams / 2) return "mid";
    return "bottom";
  };

  const getTeamTrend = (): TeamStanding["trend"] => {
    // For now, return stable since we don't have historical data
    return "stable";
  };

  useEffect(() => {
    const loadTeamData = async () => {
      if (!token || !user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch teams and leagues in parallel, like Leagues page does
        const [teams, leagues] = await Promise.all([
          fetchMyTeams(),
          fetchLeagues(),
        ]);

        if (!teams || teams.length === 0) {
          setTeamStandings([]);
          setIsLoading(false);
          return;
        }

        // Process teams to create standings display
        const teamStandingsData: TeamStanding[] = [];

        for (const team of teams) {
          // Find the league for this team
          const league = leagues.find((l: any) => l.id === team.league_id);

          if (league) {
            // Get leaderboard for this league
            const leaderboard = await fetchLeagueStandings(team.league_id);

            // Find user's position in leaderboard
            const userEntry = leaderboard.find(
              (entry: any) => entry.user_id === user.id
            );

            const currentRank = userEntry?.position || 1;
            const totalTeams = leaderboard.length || 1;

            const teamStanding: TeamStanding = {
              id: team.id,
              league_name: league.name,
              team_name: team.team_name || `${user.username}'s Team`,
              current_rank: currentRank,
              total_teams: totalTeams,
              points: team.total_points || 0,
              status: getTeamStatus(currentRank, totalTeams),
              trend: getTeamTrend(),
              league_id: team.league_id,
            };

            teamStandingsData.push(teamStanding);
          }
        }

        setTeamStandings(teamStandingsData);
      } catch (error) {
        console.error("Dashboard: Error loading team data:", error);
        setError("Failed to load team data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [token, user]);

  const refreshTeamData = async () => {
    if (!token || !user) return;

    setError(null);
    try {
      setIsLoading(true);

      const [teams, leagues] = await Promise.all([
        fetchMyTeams(),
        fetchLeagues(),
      ]);

      if (!teams || teams.length === 0) {
        setTeamStandings([]);
        return;
      }

      const teamStandingsData: TeamStanding[] = [];

      for (const team of teams) {
        const league = leagues.find((l: any) => l.id === team.league_id);

        if (league) {
          const leaderboard = await fetchLeagueStandings(team.league_id);
          const userEntry = leaderboard.find(
            (entry: any) => entry.user_id === user.id
          );

          const currentRank = userEntry?.position || 1;
          const totalTeams = leaderboard.length || 1;

          const teamStanding: TeamStanding = {
            id: team.id,
            league_name: league.name,
            team_name: team.team_name || `${user.username}'s Team`,
            current_rank: currentRank,
            total_teams: totalTeams,
            points: team.total_points || 0,
            status: getTeamStatus(currentRank, totalTeams),
            trend: getTeamTrend(),
            league_id: team.league_id,
          };

          teamStandingsData.push(teamStanding);
        }
      }

      setTeamStandings(teamStandingsData);
    } catch (error) {
      console.error("Error refreshing team data:", error);
      setError("Failed to refresh team data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "leading":
        return "success";
      case "top3":
        return "primary";
      case "mid":
        return "warning";
      case "bottom":
        return "error";
      default:
        return "default";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpward fontSize="small" sx={{ color: "success.main" }} />;
      case "down":
        return <ArrowDownward fontSize="small" sx={{ color: "error.main" }} />;
      default:
        return <SportsGolf fontSize="small" sx={{ color: "text.secondary" }} />;
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: "Place New Bet",
      subtitle: "Track your golf betting performance",
      icon: <AttachMoney />,
      action: () => navigate("/bets"),
      color: "primary",
      buttonText: "Start Betting",
    },
    {
      title: "Join League",
      subtitle: "Compete in fantasy golf leagues",
      icon: <EmojiEvents />,
      action: () => navigate("/leagues"),
      color: "secondary",
      buttonText: "Join Now",
    },
    {
      title: "View Tournaments",
      subtitle: "Latest tournament data and analysis",
      icon: <SportsGolf />,
      action: () => navigate("/tournaments"),
      color: "success",
      buttonText: "Explore",
    },
    {
      title: "Player Stats",
      subtitle: "Comprehensive player analytics",
      icon: <TrendingUp />,
      action: () => navigate("/players"),
      color: "info",
      buttonText: "Analyze",
    },
  ];

  const WelcomeCard = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        mb: 3,
      }}
    >
      <CardContent sx={{ py: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <SportsGolf fontSize={isMobile ? "medium" : "large"} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Welcome back, {user?.first_name || user?.username}! 🏌️‍♂️
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Here's your latest standings and betting performance.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const StatsCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "primary",
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: "up" | "down" | "stable";
    color?: "primary" | "success" | "error" | "warning" | "info";
  }) => (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: `${color}.main`, width: 40, height: 40 }}>
            {icon}
          </Avatar>
          {trend && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getTrendIcon(trend)}
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 700, mb: 0.5, color: `${color}.main` }}
        >
          {value}
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const TeamStandingsCard = () => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Leaderboard color="primary" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Your Teams & Standings
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={refreshTeamData}
              disabled={isLoading}
              title="Refresh team data"
            >
              <Refresh fontSize="small" />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/leagues")}
              sx={{ minWidth: "auto", px: { xs: 1, sm: 2 } }}
            >
              {isSmallMobile ? "View" : "View All"}
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
                <Skeleton variant="rectangular" width={60} height={24} />
              </Box>
            ))}
          </Stack>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={refreshTeamData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : teamStandings.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <EmojiEvents
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active teams yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Join a fantasy league to start competing!
            </Typography>
            <Button variant="contained" onClick={() => navigate("/leagues")}>
              Join Your First League
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {teamStandings.map((team) => (
              <Paper
                key={team.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => navigate(`/leagues?leagueId=${team.league_id}`)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${getStatusColor(team.status)}.main`,
                      width: 40,
                      height: 40,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    #{team.current_rank}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                      noWrap
                    >
                      {team.team_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {team.league_name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {team.points.toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        pts
                      </Typography>
                      {getTrendIcon(team.trend)}
                    </Box>
                    <Chip
                      label={`${team.current_rank} of ${team.total_teams}`}
                      size="small"
                      color={getStatusColor(team.status) as any}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const BettingStatsCard = () => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assessment color="primary" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Betting Performance
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={refreshStats}
            disabled={statsLoading}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Box>

        {statsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : statsError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refreshStats}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {statsError}
          </Alert>
        ) : bettingStats ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatsCard
                title="Total Bets"
                value={bettingStats.total_bets}
                subtitle="Lifetime wagers"
                icon={<AttachMoney fontSize="small" />}
                color="primary"
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                title="Win Rate"
                value={`${bettingStats.win_percentage.toFixed(1)}%`}
                subtitle="Success percentage"
                icon={<TrendingUp fontSize="small" />}
                color="success"
                trend={bettingStats.win_percentage > 50 ? "up" : "down"}
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                title="Total Profit"
                value={`$${
                  bettingStats.net_profit > 0 ? "+" : ""
                }${bettingStats.net_profit.toFixed(0)}`}
                subtitle="Net earnings"
                icon={<ShowChart fontSize="small" />}
                color={bettingStats.net_profit > 0 ? "success" : "error"}
                trend={bettingStats.net_profit > 0 ? "up" : "down"}
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                title="ROI"
                value={`${
                  bettingStats.roi_percentage > 0 ? "+" : ""
                }${bettingStats.roi_percentage.toFixed(1)}%`}
                subtitle="Return on investment"
                icon={<Timeline fontSize="small" />}
                color={bettingStats.roi_percentage > 0 ? "success" : "error"}
                trend={bettingStats.roi_percentage > 0 ? "up" : "down"}
              />
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <AttachMoney
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No betting data yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by placing your first bet to track performance!
            </Typography>
            <Button variant="contained" onClick={() => navigate("/bets")}>
              Place Your First Bet
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: `${action.color}.main`,
                    transform: "translateY(-1px)",
                    boxShadow: theme.shadows[4],
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={action.action}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}.main`,
                        width: 36,
                        height: 36,
                      }}
                    >
                      {React.cloneElement(action.icon as React.ReactElement, {
                        fontSize: "small",
                      })}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.25 }}
                      >
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  color={action.color}
                  size="small"
                  fullWidth
                  endIcon={<PlayArrow fontSize="small" />}
                  sx={{ mt: 2 }}
                >
                  {action.buttonText}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <WelcomeCard />

      <Grid container spacing={3}>
        {/* Left Column: Main Content */}
        <Grid item xs={12} lg={8}>
          <TeamStandingsCard />
        </Grid>

        {/* Right Column: Sidebar Widgets */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <BettingStatsCard />
            <QuickActionsCard />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
