import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Grid,
  Avatar,
  Paper,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  Refresh,
  EmojiEvents,
  Assessment,
  Leaderboard,
  TrendingUp,
  Warning,
  Upgrade,
  Close,
  Info,
  TrendingDown,
  TrendingFlat,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import SortableTable, { Column } from "../components/common/SortableTable";
import {
  useTournamentLeaderboard,
  useLiveTournamentStats,
  useLiveHoleStats,
} from "../hooks/useDataGolf";

// Removed TabPanel component - using direct conditional rendering for better mobile compatibility

interface HoleWaveStats {
  avg_score: number;
  players_thru: number;
  eagles_or_better: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubles_or_worse: number;
}

interface HoleStats {
  hole: number;
  par: number;
  yardage: number;
  total: HoleWaveStats;
  morning_wave: HoleWaveStats;
  afternoon_wave: HoleWaveStats;
}

interface CourseRound {
  round_num: number;
  holes: HoleStats[];
}

interface CourseData {
  course_code: string;
  rounds: CourseRound[];
}

interface LiveHoleStatsResponse {
  event_name: string;
  last_update: string;
  current_round: number;
  courses: CourseData[];
}

const TournamentDetail: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedHole, setSelectedHole] = useState<HoleStats | null>(null);
  const [holeModalOpen, setHoleModalOpen] = useState(false);
  const navigate = useNavigate();
  const { tour, eventId, year } = useParams<{
    tour: string;
    eventId: string;
    year: string;
  }>();

  const {
    data: leaderboard,
    loading: loadingLeaderboard,
    error: errorLeaderboard,
    refetch: refetchLeaderboard,
  } = useTournamentLeaderboard(
    tour || "pga",
    eventId || "",
    parseInt(year || "0")
  );

  // Live tournament stats hook
  const {
    data: liveStats,
    loading: loadingLiveStats,
    error: errorLiveStats,
    refetch: refetchLiveStats,
  } = useLiveTournamentStats();

  // Live hole stats hook
  const {
    data: liveHoleStats,
    loading: loadingLiveHoleStats,
    error: errorLiveHoleStats,
    refetch: refetchLiveHoleStats,
  } = useLiveHoleStats(tour || "pga");

  const [tournamentInfo, setTournamentInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch tournament info from schedule or events
    // For now, we'll create a mock tournament info based on params
    if (tour && eventId && year) {
      setTournamentInfo({
        event_name: `Tournament ${eventId}`,
        tour: tour.toUpperCase(),
        year: year,
        event_id: eventId,
      });
    }
  }, [tour, eventId, year]);

  // Removed handleTabChange - using inline function for better mobile responsiveness

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Process hole stats data for difficulty ranking
  const processHoleData = (holeStatsData: any): HoleStats[] => {
    if (!holeStatsData || !holeStatsData.courses) return [];

    const allHoles: HoleStats[] = [];

    holeStatsData.courses.forEach((course: CourseData) => {
      course.rounds.forEach((round: CourseRound) => {
        round.holes.forEach((hole: HoleStats) => {
          allHoles.push(hole);
        });
      });
    });

    // Sort by difficulty relative to par (highest over par = hardest first)
    return allHoles.sort((a, b) => {
      const aDiffFromPar = a.total.avg_score - a.par;
      const bDiffFromPar = b.total.avg_score - b.par;
      return bDiffFromPar - aDiffFromPar; // Highest positive difference first
    });
  };

  const handleHoleClick = (hole: HoleStats) => {
    setSelectedHole(hole);
    setHoleModalOpen(true);
  };

  const handleCloseHoleModal = () => {
    setHoleModalOpen(false);
    setSelectedHole(null);
  };

  const getDifficultyColor = (avgScore: number, par: number) => {
    const overPar = avgScore - par;
    if (overPar >= 0.5) return "#f44336"; // Hard - Red
    if (overPar >= 0.25) return "#ff9800"; // Medium-Hard - Orange
    if (overPar >= 0) return "#ffeb3b"; // Medium - Yellow
    if (overPar >= -0.25) return "#8bc34a"; // Easy - Light Green
    return "#4caf50"; // Very Easy - Green
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Detect if this is a live tournament based on the data structure
  const isLiveTournament =
    leaderboard &&
    leaderboard.length > 0 &&
    (leaderboard[0].sg_total !== undefined ||
      leaderboard[0].course_name !== undefined);

  // Debug leaderboard data
  useEffect(() => {


    if (leaderboard && leaderboard.length > 0) {
      console.log("   First entry:", leaderboard[0]);
      console.log("   Has sg_total:", leaderboard[0].sg_total !== undefined);
      console.log(
        "   Has course_name:",
        leaderboard[0].course_name !== undefined
      );
      console.log("   Error field:", leaderboard[0].error);
    }
  }, [
    tour,
    eventId,
    year,
    loadingLeaderboard,
    errorLeaderboard,
    leaderboard,
    isLiveTournament,
  ]);

  // Define columns for leaderboard table (dynamic based on tournament type)
  const leaderboardColumns: Column[] = isLiveTournament
    ? [
        {
          id: "position",
          label: "Pos",
          minWidth: 60,
          align: "center",
          format: (value) => {
            if (!value) return "CUT";
            return typeof value === "number" ? value : value;
          },
        },
        {
          id: "player_name",
          label: "Player",
          minWidth: 200,
          format: (value, row) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                {getInitials(value || "?")}
              </Avatar>
              <Typography fontWeight="medium">{value}</Typography>
            </Box>
          ),
        },
        {
          id: "total_score",
          label: "Score",
          minWidth: 80,
          align: "center",
          format: (value) => {
            if (value === 0) return "E";
            if (value > 0) return `+${value}`;
            return value;
          },
        },
        {
          id: "thru",
          label: "Thru",
          minWidth: 60,
          align: "center",
          format: (value) => {
            if (!value) return "-";
            return value;
          },
        },
        {
          id: "today",
          label: "R",
          minWidth: 50,
          align: "center",
          format: (value) => {
            if (!value) return "-";
            return `R${value}`;
          },
        },
        {
          id: "sg_total",
          label: "SG Total",
          minWidth: 100,
          align: "center",
          format: (value) => {
            if (value === null || value === undefined) return "-";
            return typeof value === "number" ? value.toFixed(2) : value;
          },
        },
        {
          id: "sg_ott",
          label: "SG OTT",
          minWidth: 90,
          align: "center",
          format: (value) => {
            if (value === null || value === undefined) return "-";
            return typeof value === "number" ? value.toFixed(2) : value;
          },
        },
        {
          id: "sg_app",
          label: "SG APP",
          minWidth: 90,
          align: "center",
          format: (value) => {
            if (value === null || value === undefined) return "-";
            return typeof value === "number" ? value.toFixed(2) : value;
          },
        },
        {
          id: "sg_putt",
          label: "SG Putt",
          minWidth: 90,
          align: "center",
          format: (value) => {
            if (value === null || value === undefined) return "-";
            return typeof value === "number" ? value.toFixed(2) : value;
          },
        },
      ]
    : [
        {
          id: "position",
          label: "Pos",
          minWidth: 60,
          align: "center",
          format: (value) => {
            if (!value) return "CUT";
            return typeof value === "number" ? value : value;
          },
        },
        {
          id: "player_name",
          label: "Player",
          minWidth: 200,
          format: (value, row) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                {getInitials(value || "?")}
              </Avatar>
              <Typography fontWeight="medium">{value}</Typography>
            </Box>
          ),
        },
        {
          id: "total_score",
          label: "Score",
          minWidth: 80,
          align: "center",
          format: (value) => {
            if (value === 0) return "E";
            if (value > 0) return `+${value}`;
            return value;
          },
        },
        {
          id: "thru",
          label: "Thru",
          minWidth: 60,
          align: "center",
          format: (value) => {
            if (!value) return "-";
            return value;
          },
        },
        {
          id: "rounds",
          label: "Rounds",
          minWidth: 120,
          align: "center",
          format: (value) => {
            if (!value || !Array.isArray(value)) return "-";
            return value.join("-");
          },
        },
        {
          id: "win_probability",
          label: "Win %",
          minWidth: 80,
          align: "center",
          format: (value) => {
            if (!value && value !== 0) return "-";
            return `${(parseFloat(value) * 100).toFixed(1)}%`;
          },
        },
        {
          id: "opening_odds",
          label: "Opening Odds",
          minWidth: 100,
          align: "center",
          format: (value) => {
            if (!value) return "-";
            return `${parseFloat(value).toFixed(1)}`;
          },
        },
        {
          id: "made_cut",
          label: "Status",
          minWidth: 80,
          align: "center",
          format: (value, row) => {
            // For live tournaments, show cut status if available
            if (row?.made_cut === false) {
              return <Chip label="Missed Cut" size="small" color="error" />;
            }
            if (row?.made_cut === true) {
              return <Chip label="Made Cut" size="small" color="success" />;
            }
            // Default to active for live tournaments
            return <Chip label="Active" size="small" color="primary" />;
          },
        },
      ];

  // Define columns for live tournament stats table
  const liveStatsColumns: Column[] = [
    {
      id: "player_name",
      label: "Player",
      minWidth: 180,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
            {getInitials(value || "?")}
          </Avatar>
          <Typography fontWeight="medium">{value}</Typography>
        </Box>
      ),
    },
    {
      id: "sg_total",
      label: "SG Total",
      minWidth: 100,
      align: "center",
      format: (value) => {
        if (value === null || value === undefined) return "-";
        return typeof value === "number" ? value.toFixed(2) : value;
      },
    },
    {
      id: "sg_ott",
      label: "SG Off Tee",
      minWidth: 100,
      align: "center",
      format: (value) => {
        if (value === null || value === undefined) return "-";
        return typeof value === "number" ? value.toFixed(2) : value;
      },
    },
    {
      id: "sg_app",
      label: "SG Approach",
      minWidth: 100,
      align: "center",
      format: (value) => {
        if (value === null || value === undefined) return "-";
        return typeof value === "number" ? value.toFixed(2) : value;
      },
    },
    {
      id: "sg_arg",
      label: "SG Around",
      minWidth: 100,
      align: "center",
      format: (value) => {
        if (value === null || value === undefined) return "-";
        return typeof value === "number" ? value.toFixed(2) : value;
      },
    },
    {
      id: "sg_putt",
      label: "SG Putting",
      minWidth: 100,
      align: "center",
      format: (value) => {
        if (value === null || value === undefined) return "-";
        return typeof value === "number" ? value.toFixed(2) : value;
      },
    },
  ];

  // Process hole data for display
  const processedHoles = processHoleData(liveHoleStats);

  // Define columns for hole difficulty ranking table
  const holeDifficultyColumns: Column[] = [
    {
      id: "hole",
      label: "Hole",
      minWidth: 70,
      align: "center",
      format: (value) => (
        <Typography variant="body2" fontWeight="bold">
          #{value}
        </Typography>
      ),
    },
    {
      id: "par",
      label: "Par",
      minWidth: 60,
      align: "center",
      format: (value) => (
        <Chip label={`Par ${value}`} size="small" variant="outlined" />
      ),
    },
    {
      id: "yardage",
      label: "Yards",
      minWidth: 80,
      align: "center",
      format: (value) => (
        <Typography variant="body2">{value || "—"}</Typography>
      ),
    },
    {
      id: "avg_score",
      label: "Avg Score",
      minWidth: 100,
      align: "center",
      format: (value, row) => {
        const avgScore = value || 0;
        const par = row?.par || 4;
        const overPar = avgScore - par;
        const color = getDifficultyColor(avgScore, par);

        return (
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ color }}>
              {avgScore.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({overPar >= 0 ? "+" : ""}
              {overPar.toFixed(2)})
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "difficulty_rank",
      label: "Difficulty",
      minWidth: 100,
      align: "center",
      format: (value: any, row: any) => {
        // Calculate rank based on hole number and sorted data
        const holeNumber = row?.hole || 0;
        const rank = processedHoles.findIndex((h) => h.hole === holeNumber) + 1;
        let icon = <TrendingUpOutlined />;
        let color = "#f44336";

        if (rank <= 3) {
          icon = <TrendingUp />;
          color = "#f44336";
        } else if (rank <= 6) {
          icon = <TrendingUpOutlined />;
          color = "#ff9800";
        } else if (rank <= 12) {
          icon = <TrendingFlat />;
          color = "#ffeb3b";
        } else if (rank <= 15) {
          icon = <TrendingDown />;
          color = "#8bc34a";
        } else {
          icon = <TrendingDown />;
          color = "#4caf50";
        }

        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={0.5}
          >
            <Box sx={{ color }}>{icon}</Box>
            <Typography variant="caption" sx={{ color }}>
              {rank}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "players_thru",
      label: "Players",
      minWidth: 80,
      align: "center",
      format: (value, row) => (
        <Typography variant="body2">{row?.total?.players_thru || 0}</Typography>
      ),
    },
  ];

  const getTabContent = () => {
    if (loadingLeaderboard) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      );
    }

    // Check for errors in leaderboard data
    if (leaderboard && leaderboard.length > 0 && leaderboard[0].error) {
      const errorData = leaderboard[0];

      // Handle subscription required error
      if (errorData.error === "subscription_required") {
        return (
          <Stack spacing={3} sx={{ p: 3 }}>
            <Alert
              severity="warning"
              icon={<Upgrade />}
              sx={{
                "& .MuiAlert-message": { width: "100%" },
                backgroundColor: "#fff3cd",
                borderColor: "#f0ad4e",
                color: "#8a6d3b",
              }}
            >
              <AlertTitle sx={{ fontWeight: "bold", mb: 1 }}>
                DataGolf Subscription Upgrade Required
              </AlertTitle>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {errorData.message}
              </Typography>

              {errorData.features_missing && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Features requiring upgrade:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {errorData.features_missing.map(
                      (feature: string, index: number) => (
                        <Typography key={index} component="li" variant="body2">
                          {feature}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => window.open(errorData.upgrade_url, "_blank")}
                startIcon={<Upgrade />}
              >
                Upgrade DataGolf Subscription
              </Button>
            </Alert>

            <Alert severity="info">
              <AlertTitle>Alternative Options</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                While waiting for the DataGolf upgrade, you can still:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body2">
                  View upcoming tournament schedules and player information
                </Typography>
                <Typography component="li" variant="body2">
                  Access live tournament predictions and rankings
                </Typography>
                <Typography component="li" variant="body2">
                  Use fantasy league features with current data
                </Typography>
                <Typography component="li" variant="body2">
                  Manually enter historical results for your leagues
                </Typography>
              </Box>
            </Alert>
          </Stack>
        );
      }

      // Handle no live data error
      if (errorData.error === "no_live_data") {
        return (
          <Stack spacing={2} sx={{ p: 3 }}>
            <Alert severity="info" icon={<Warning />}>
              <AlertTitle>No Live Tournament Data Available</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {errorData.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {errorData.suggestion}
              </Typography>
            </Alert>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refetchLeaderboard}
              disabled={loadingLeaderboard}
            >
              Try Again
            </Button>
          </Stack>
        );
      }

      // Handle general fetch failure
      if (errorData.error === "fetch_failed") {
        return (
          <Stack spacing={2} sx={{ p: 3 }}>
            <Alert severity="error" icon={<Warning />}>
              <AlertTitle>Failed to Load Tournament Data</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {errorData.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {errorData.suggestion}
              </Typography>
            </Alert>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refetchLeaderboard}
              disabled={loadingLeaderboard}
            >
              Try Again
            </Button>
          </Stack>
        );
      }
    }

    return (
      <CardContent>
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="h6">
            {isLiveTournament
              ? "Live Tournament Leaderboard"
              : "Tournament Leaderboard"}
          </Typography>
          {isLiveTournament && (
            <Chip
              label="LIVE"
              color="success"
              size="small"
              sx={{
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={refetchLeaderboard}
            disabled={loadingLeaderboard}
          >
            Refresh
          </Button>
        </Box>

        {/* Show tournament info for live tournaments */}
        {isLiveTournament &&
          leaderboard &&
          leaderboard.length > 0 &&
          leaderboard[0].course_name && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {leaderboard[0].event_name}
                </Typography>
                <Typography variant="body2">
                  Course: {leaderboard[0].course_name}
                </Typography>
                {leaderboard[0].last_updated && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated:{" "}
                    {new Date(leaderboard[0].last_updated).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Alert>
          )}

        {errorLeaderboard && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading leaderboard: {errorLeaderboard}
          </Alert>
        )}

        <SortableTable
          columns={leaderboardColumns}
          data={leaderboard || []}
          loading={loadingLeaderboard}
          searchPlaceholder="Search players..."
          defaultSortColumn="total_score"
          defaultSortDirection="asc"
          title={`${isLiveTournament ? "Live Leaderboard" : "Leaderboard"} (${
            leaderboard?.length || 0
          } players)`}
        />
      </CardContent>
    );
  };

  if (!tour || !eventId || !year) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Invalid tournament parameters</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/tournaments")}
          sx={{ mb: 2 }}
        >
          Back to Tournaments
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <EmojiEvents color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1">
              {tournamentInfo?.event_name || `Event ${eventId}`}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
              <Chip label={tour.toUpperCase()} color="primary" size="small" />
              <Typography variant="body1" color="text.secondary">
                {year}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Event ID: {eventId}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Tournament results and statistics from DataGolf
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        aria-label="tournament detail tabs"
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<Leaderboard />}
          label="Leaderboard"
          id="tournament-detail-tab-0"
          aria-controls="tournament-detail-tabpanel-0"
        />
        <Tab
          icon={<Assessment />}
          label="Statistics"
          id="tournament-detail-tab-1"
          aria-controls="tournament-detail-tabpanel-1"
        />
        <Tab
          icon={<TrendingUp />}
          label="Performance"
          id="tournament-detail-tab-2"
          aria-controls="tournament-detail-tabpanel-2"
        />
      </Tabs>

      {/* Leaderboard Tab */}
      {tabValue === 0 && (
        <Card>
          <Box sx={{ pt: 3 }}>{getTabContent()}</Box>
        </Card>
      )}

      {/* Statistics Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <Typography variant="h6">Live Tournament Statistics</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={refetchLiveStats}
                disabled={loadingLiveStats}
              >
                Refresh
              </Button>
            </Box>

            {errorLiveStats && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading live stats: {errorLiveStats}
              </Alert>
            )}

            {loadingLiveStats ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="300px"
              >
                <CircularProgress />
              </Box>
            ) : (
              <SortableTable
                columns={liveStatsColumns}
                data={liveStats?.live_stats || liveStats || []}
                loading={loadingLiveStats}
                searchPlaceholder="Search players..."
                defaultSortColumn="sg_total"
                defaultSortDirection="desc"
                title={`Live Stats (${
                  (liveStats?.live_stats || liveStats || []).length
                } players)`}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <Typography variant="h6">Hole Difficulty Analysis</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={refetchLiveHoleStats}
                disabled={loadingLiveHoleStats}
              >
                Refresh
              </Button>
            </Box>

            {/* Tournament Info */}
            {liveHoleStats && liveHoleStats.event_name && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {liveHoleStats.event_name}
                  </Typography>
                  <Typography variant="body2">
                    Current Round: {liveHoleStats.current_round} • Last Updated:{" "}
                    {liveHoleStats.last_update}
                  </Typography>
                </Box>
              </Alert>
            )}

            {errorLiveHoleStats && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading hole stats: {errorLiveHoleStats}
              </Alert>
            )}

            {loadingLiveHoleStats ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="300px"
              >
                <CircularProgress />
              </Box>
            ) : processedHoles.length === 0 ? (
              <Alert severity="warning">
                No hole statistics available. This data is only available during
                live tournaments.
              </Alert>
            ) : (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Holes ranked by difficulty (hardest to easiest). Click on any
                  hole to view detailed scoring breakdown.
                </Typography>
                <Paper sx={{ cursor: "pointer" }}>
                  <SortableTable
                    columns={holeDifficultyColumns}
                    data={processedHoles.map((hole) => ({
                      ...hole,
                      avg_score: hole.total.avg_score,
                      players_thru: hole.total.players_thru,
                      difficulty_score: hole.total.avg_score - hole.par, // Difference from par for sorting
                    }))}
                    loading={loadingLiveHoleStats}
                    searchPlaceholder="Search holes..."
                    defaultSortColumn="difficulty_score"
                    defaultSortDirection="desc"
                    title={`Hole Difficulty Ranking (${processedHoles.length} holes)`}
                    onRowClick={(hole: any) => handleHoleClick(hole)}
                  />
                </Paper>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hole Detail Modal */}
      <Dialog
        open={holeModalOpen}
        onClose={handleCloseHoleModal}
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
                Hole #{selectedHole?.hole} - Par {selectedHole?.par}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedHole?.yardage
                  ? `${selectedHole.yardage} yards`
                  : "Yardage not available"}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseHoleModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedHole && (
            <Grid container spacing={3}>
              {/* Overall Statistics */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Overall Statistics
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            sx={{
                              color: getDifficultyColor(
                                selectedHole.total.avg_score,
                                selectedHole.par
                              ),
                            }}
                          >
                            {selectedHole.total.avg_score.toFixed(2)}
                          </Typography>
                          <Typography variant="caption">
                            Average Score
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary">
                            {selectedHole.total.players_thru}
                          </Typography>
                          <Typography variant="caption">
                            Players Through
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            sx={{
                              color:
                                selectedHole.total.avg_score > selectedHole.par
                                  ? "#f44336"
                                  : "#4caf50",
                            }}
                          >
                            {selectedHole.total.avg_score > selectedHole.par
                              ? "+"
                              : ""}
                            {(
                              selectedHole.total.avg_score - selectedHole.par
                            ).toFixed(2)}
                          </Typography>
                          <Typography variant="caption">vs Par</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="text.secondary">
                            #
                            {processedHoles.findIndex(
                              (h) => h.hole === selectedHole.hole
                            ) + 1}
                          </Typography>
                          <Typography variant="caption">
                            Difficulty Rank
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Scoring Distribution */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Scoring Distribution
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Eagles+",
                      value: selectedHole.total.eagles_or_better,
                      color: "#4caf50",
                    },
                    {
                      label: "Birdies",
                      value: selectedHole.total.birdies,
                      color: "#8bc34a",
                    },
                    {
                      label: "Pars",
                      value: selectedHole.total.pars,
                      color: "#ffeb3b",
                    },
                    {
                      label: "Bogeys",
                      value: selectedHole.total.bogeys,
                      color: "#ff9800",
                    },
                    {
                      label: "Double+",
                      value: selectedHole.total.doubles_or_worse,
                      color: "#f44336",
                    },
                  ].map((score) => (
                    <Grid item xs={6} md={2.4} key={score.label}>
                      <Card
                        variant="outlined"
                        sx={{ backgroundColor: `${score.color}20` }}
                      >
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h5" sx={{ color: score.color }}>
                            {score.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {score.label}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {formatPercentage(
                              score.value,
                              selectedHole.total.players_thru
                            )}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (score.value / selectedHole.total.players_thru) *
                              100
                            }
                            sx={{
                              mt: 1,
                              backgroundColor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: score.color,
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Wave Comparison */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tee Time Wave Comparison
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Morning Wave
                        </Typography>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="body2">
                            Average Score:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedHole.morning_wave.avg_score.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="body2">
                            Players Through:
                          </Typography>
                          <Typography variant="body2">
                            {selectedHole.morning_wave.players_thru}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                          <Typography variant="caption" display="block">
                            Eagles+:{" "}
                            {selectedHole.morning_wave.eagles_or_better} (
                            {formatPercentage(
                              selectedHole.morning_wave.eagles_or_better,
                              selectedHole.morning_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Birdies: {selectedHole.morning_wave.birdies} (
                            {formatPercentage(
                              selectedHole.morning_wave.birdies,
                              selectedHole.morning_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Pars: {selectedHole.morning_wave.pars} (
                            {formatPercentage(
                              selectedHole.morning_wave.pars,
                              selectedHole.morning_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Bogeys: {selectedHole.morning_wave.bogeys} (
                            {formatPercentage(
                              selectedHole.morning_wave.bogeys,
                              selectedHole.morning_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Double+:{" "}
                            {selectedHole.morning_wave.doubles_or_worse} (
                            {formatPercentage(
                              selectedHole.morning_wave.doubles_or_worse,
                              selectedHole.morning_wave.players_thru
                            )}
                            )
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Afternoon Wave
                        </Typography>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="body2">
                            Average Score:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedHole.afternoon_wave.avg_score.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="body2">
                            Players Through:
                          </Typography>
                          <Typography variant="body2">
                            {selectedHole.afternoon_wave.players_thru}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                          <Typography variant="caption" display="block">
                            Eagles+:{" "}
                            {selectedHole.afternoon_wave.eagles_or_better} (
                            {formatPercentage(
                              selectedHole.afternoon_wave.eagles_or_better,
                              selectedHole.afternoon_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Birdies: {selectedHole.afternoon_wave.birdies} (
                            {formatPercentage(
                              selectedHole.afternoon_wave.birdies,
                              selectedHole.afternoon_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Pars: {selectedHole.afternoon_wave.pars} (
                            {formatPercentage(
                              selectedHole.afternoon_wave.pars,
                              selectedHole.afternoon_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Bogeys: {selectedHole.afternoon_wave.bogeys} (
                            {formatPercentage(
                              selectedHole.afternoon_wave.bogeys,
                              selectedHole.afternoon_wave.players_thru
                            )}
                            )
                          </Typography>
                          <Typography variant="caption" display="block">
                            Double+:{" "}
                            {selectedHole.afternoon_wave.doubles_or_worse} (
                            {formatPercentage(
                              selectedHole.afternoon_wave.doubles_or_worse,
                              selectedHole.afternoon_wave.players_thru
                            )}
                            )
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Wave Comparison Summary */}
              <Grid item xs={12}>
                <Alert
                  severity={
                    Math.abs(
                      selectedHole.morning_wave.avg_score -
                        selectedHole.afternoon_wave.avg_score
                    ) > 0.1
                      ? "warning"
                      : "info"
                  }
                >
                  <Typography variant="body2">
                    <strong>Wave Analysis:</strong>{" "}
                    {selectedHole.morning_wave.avg_score >
                    selectedHole.afternoon_wave.avg_score
                      ? `Afternoon wave played ${(
                          selectedHole.morning_wave.avg_score -
                          selectedHole.afternoon_wave.avg_score
                        ).toFixed(2)} strokes better on average`
                      : selectedHole.afternoon_wave.avg_score >
                        selectedHole.morning_wave.avg_score
                      ? `Morning wave played ${(
                          selectedHole.afternoon_wave.avg_score -
                          selectedHole.morning_wave.avg_score
                        ).toFixed(2)} strokes better on average`
                      : "Both waves performed similarly"}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoleModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentDetail;
