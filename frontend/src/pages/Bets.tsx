import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../api";
import { useBettingStats } from "../hooks/useBettingStats";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MuiMenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Fab,
} from "@mui/material";
import {
  AttachMoney,
  Add,
  TrendingUp,
  History,
  Sports,
  EmojiEvents,
  Assessment,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  Download,
  Delete,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Types
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

interface Bet {
  id: number;
  tournament_id?: number;
  player_id?: number;
  bet_type: string;
  amount: number;
  odds?: number;
  potential_payout?: number;
  status: "pending" | "won" | "lost" | "pushed";
  placed_at: string;
  settled_at?: string;
  description?: string;
  tournament?: Tournament;
  player?: Player;
}

const betTypeOptions = [
  { value: "outright", label: "Tournament Win", icon: "🏆" },
  { value: "top_5", label: "Top 5 Finish", icon: "🥉" },
  { value: "top_10", label: "Top 10 Finish", icon: "📈" },
  { value: "top_20", label: "Top 20 Finish", icon: "⬆️" },
  { value: "make_cut", label: "Make the Cut", icon: "✂️" },
  { value: "miss_cut", label: "Miss the Cut", icon: "❌" },
  { value: "head_to_head", label: "Head to Head", icon: "⚔️" },
  { value: "first_round_leader", label: "First Round Leader", icon: "🚀" },
  { value: "other", label: "Other", icon: "💭" },
];

const Bets: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { stats, refreshStats } = useBettingStats();
  const [addBetOpen, setAddBetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBetId, setSelectedBetId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form state
  const [betForm, setBetForm] = useState({
    tournament_id: "",
    player_id: "",
    bet_type: "",
    amount: "",
    odds: "",
    description: "",
    placed_at: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  });

  // Fetch data
  const fetchBets = useCallback(async () => {
    try {
      const response = await apiClient.get("/bets/");
      setBets(response.data);
    } catch (err) {
      console.error("Error fetching bets:", err);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await apiClient.get("/players");
      setPlayers(response.data);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  }, []);

  const fetchTournaments = useCallback(async () => {
    try {
      const response = await apiClient.get("/tournaments");
      setTournaments(response.data);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    }
  }, []);

  useEffect(() => {
    fetchBets();
    fetchPlayers();
    fetchTournaments();
  }, [fetchBets, fetchPlayers, fetchTournaments]);

  const handleAddBet = async () => {
    if (!betForm.bet_type || !betForm.amount) {
      setError("Bet type and amount are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        tournament_id: betForm.tournament_id
          ? parseInt(betForm.tournament_id)
          : null,
        player_id: betForm.player_id ? parseInt(betForm.player_id) : null,
        bet_type: betForm.bet_type,
        amount: parseFloat(betForm.amount),
        odds: betForm.odds ? americanToDecimal(betForm.odds) : null,
        description: betForm.description || null,
        placed_at: new Date(betForm.placed_at).toISOString(),
      };

      await apiClient.post("/bets/", null, { params: payload });

      setAddBetOpen(false);
      setBetForm({
        tournament_id: "",
        player_id: "",
        bet_type: "",
        amount: "",
        odds: "",
        description: "",
        placed_at: new Date().toISOString().split("T")[0],
      });

      setSuccess("Bet added successfully!");
      fetchBets();
      refreshStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add bet");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBetStatus = async (betId: number, status: string) => {
    setLoading(true);
    try {
      await apiClient.put(`/bets/${betId}`, { status });
      setSuccess(`Bet marked as ${status}!`);
      fetchBets();
      refreshStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update bet");
    } finally {
      setLoading(false);
      setMenuAnchor(null);
      setSelectedBetId(null);
    }
  };

  const handleDeleteBet = async () => {
    if (!selectedBetId) return;

    setLoading(true);
    try {
      await apiClient.delete(`/bets/${selectedBetId}`);
      setSuccess("Bet deleted successfully!");
      fetchBets();
      refreshStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete bet");
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setMenuAnchor(null);
      setSelectedBetId(null);
    }
  };

  const confirmDeleteBet = () => {
    setMenuAnchor(null);
    setDeleteConfirmOpen(true);
  };

  const americanToDecimal = (americanOdds: string): number | null => {
    if (!americanOdds) return null;
    const cleanOdds = americanOdds.replace(/[^-+\d]/g, "");
    const odds = parseInt(cleanOdds);

    if (isNaN(odds)) return null;

    if (odds > 0) {
      return odds / 100 + 1;
    } else if (odds < 0) {
      return 100 / Math.abs(odds) + 1;
    }
    return null;
  };

  const calculatePayout = (amount: string, americanOdds: string): string => {
    if (!amount || !americanOdds) return "";

    const wagerAmount = parseFloat(amount);
    const cleanOdds = americanOdds.replace(/[^-+\d]/g, "");
    const odds = parseInt(cleanOdds);

    if (isNaN(wagerAmount) || isNaN(odds)) return "";

    let payout = 0;
    if (odds > 0) {
      payout = wagerAmount + (wagerAmount * odds) / 100;
    } else if (odds < 0) {
      payout = wagerAmount + (wagerAmount * 100) / Math.abs(odds);
    }

    return payout.toFixed(2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatOdds = (odds?: number) => {
    if (!odds) return "N/A";
    if (odds >= 2) {
      return `+${Math.round((odds - 1) * 100)}`;
    } else {
      return `-${Math.round(100 / (odds - 1))}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "pushed":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <CheckCircle color="success" />;
      case "lost":
        return <Cancel color="error" />;
      case "pushed":
        return <Schedule color="warning" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const getBetTypeDisplay = (betType: string) => {
    const option = betTypeOptions.find((opt) => opt.value === betType);
    return option ? `${option.icon} ${option.label}` : betType;
  };

  const filteredBets =
    filterStatus === "all"
      ? bets
      : bets.filter((bet) => bet.status === filterStatus);

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Tournament",
      "Player",
      "Bet Type",
      "Amount",
      "Odds",
      "Payout",
      "Status",
      "Profit",
    ];
    const csvData = bets.map((bet) => [
      new Date(bet.placed_at).toLocaleDateString(),
      bet.tournament?.name || "N/A",
      bet.player?.name || "N/A",
      bet.bet_type,
      bet.amount,
      formatOdds(bet.odds),
      bet.potential_payout || "N/A",
      bet.status,
      bet.status === "won"
        ? (bet.potential_payout || 0) - bet.amount
        : bet.status === "lost"
        ? -bet.amount
        : 0,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "betting_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data for performance over time
  const prepareChartData = () => {
    const settledBets = bets
      .filter((bet) => bet.status !== "pending")
      .sort(
        (a, b) =>
          new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime()
      );

    if (settledBets.length === 0) return [];

    // Group bets by date
    const betsByDate = new Map<
      string,
      { bets: typeof settledBets; originalDate: Date }
    >();
    settledBets.forEach((bet) => {
      const date = new Date(bet.placed_at);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });

      if (!betsByDate.has(dateStr)) {
        betsByDate.set(dateStr, { bets: [], originalDate: date });
      }
      betsByDate.get(dateStr)!.bets.push(bet);
    });

    // Calculate cumulative stats for each date
    let cumulativeProfit = 0;
    let totalWagered = 0;
    let totalWins = 0;
    let totalBets = 0;

    const chartData = Array.from(betsByDate.entries())
      .sort(
        ([, a], [, b]) => a.originalDate.getTime() - b.originalDate.getTime()
      )
      .map(([dateStr, { bets: dayBets }]) => {
        // Process all bets for this day
        dayBets.forEach((bet) => {
          let profit = 0;

          if (bet.status === "won") {
            // Use potential_payout if available, otherwise calculate from odds
            if (bet.potential_payout && bet.potential_payout > 0) {
              profit = bet.potential_payout - bet.amount;
            } else if (bet.odds && bet.odds > 0) {
              // Calculate payout from decimal odds
              const payout = bet.amount * bet.odds;
              profit = payout - bet.amount;
            } else {
              // Fallback: assume even money bet if no odds available
              profit = bet.amount;
            }
          } else if (bet.status === "lost") {
            profit = -bet.amount;
          } else if (bet.status === "pushed") {
            profit = 0;
          }

          cumulativeProfit += profit;
          totalWagered += bet.amount;
          totalBets += 1;

          if (bet.status === "won") {
            totalWins += 1;
          }
        });

        const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
        const roi =
          totalWagered > 0 ? (cumulativeProfit / totalWagered) * 100 : 0;

        return {
          date: dateStr,
          cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
          winRate: Math.round(winRate * 10) / 10,
          roi: Math.round(roi * 10) / 10,
          totalWagered: Math.round(totalWagered * 100) / 100,
          totalBets: totalBets,
        };
      });

    return chartData;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={{ xs: 2, sm: 0 }}
        mb={{ xs: 3, md: 4 }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            <AttachMoney sx={{ mr: { xs: 1, sm: 2 }, fontSize: "inherit" }} />
            Betting Tracker
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            fontSize={isMobile ? "0.875rem" : "1.25rem"}
          >
            {isMobile
              ? "Golf betting analytics & tracking"
              : "Professional golf betting analytics and performance tracking"}
          </Typography>
        </Box>
        {isMobile ? (
          <Fab
            color="primary"
            onClick={() => setAddBetOpen(true)}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Add />
          </Fab>
        ) : (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddBetOpen(true)}
            size="large"
          >
            Enter New Bet
          </Button>
        )}
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
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab
          label={isMobile ? "Dashboard" : "Dashboard"}
          icon={<Assessment />}
        />
        <Tab label={isMobile ? "Bets" : "My Bets"} icon={<History />} />
        <Tab
          label={isMobile ? "Analytics" : "Performance"}
          icon={<TrendingUp />}
        />
      </Tabs>

      {/* DASHBOARD TAB */}
      {tabValue === 0 && (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              <EmojiEvents sx={{ mr: 1, verticalAlign: "middle" }} />
              Performance Overview
            </Typography>
          </Grid>

          {stats && (
            <>
              <Grid item xs={6} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      "&:last-child": { pb: { xs: 2, sm: 3 } },
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h4" : "h3"}
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {stats.total_bets}
                    </Typography>
                    <Typography
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ opacity: 0.9 }}
                    >
                      Total Bets
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      "&:last-child": { pb: { xs: 2, sm: 3 } },
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h4" : "h3"}
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {stats.win_percentage.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ opacity: 0.9 }}
                    >
                      Win Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      "&:last-child": { pb: { xs: 2, sm: 3 } },
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h5" : "h3"}
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {formatCurrency(stats.total_wagered)}
                    </Typography>
                    <Typography
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ opacity: 0.9 }}
                    >
                      Total Wagered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      stats.net_profit >= 0
                        ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                        : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    color: "white",
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      "&:last-child": { pb: { xs: 2, sm: 3 } },
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h5" : "h3"}
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {formatCurrency(stats.net_profit)}
                    </Typography>
                    <Typography
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ opacity: 0.9 }}
                    >
                      Net Profit
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                {stats && (
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        ROI
                      </Typography>
                      <Typography
                        variant="h5"
                        color={
                          stats.roi_percentage >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {stats.roi_percentage.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Bet Size
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          stats.total_wagered / stats.total_bets || 0
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Won Bets
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {stats.won_bets}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Pending Bets
                      </Typography>
                      <Typography variant="h5">{stats.pending_bets}</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* MY BETS TAB */}
      {tabValue === 1 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5">My Betting History</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Bets</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="won">Won</MenuItem>
                  <MenuItem value="lost">Lost</MenuItem>
                  <MenuItem value="pushed">Pushed</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={exportToCSV}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Tournament</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell>Bet Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Odds</TableCell>
                  <TableCell align="right">Potential Payout</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Profit/Loss</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Box py={4}>
                        <Sports
                          sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          {filterStatus === "all"
                            ? "No bets yet"
                            : `No ${filterStatus} bets`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {filterStatus === "all"
                            ? "Add your first bet to start tracking your performance!"
                            : "Try changing the filter or add more bets."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBets.map((bet) => {
                    const profit =
                      bet.status === "won"
                        ? (bet.potential_payout || 0) - bet.amount
                        : bet.status === "lost"
                        ? -bet.amount
                        : 0;

                    return (
                      <TableRow key={bet.id} hover>
                        <TableCell>
                          {new Date(bet.placed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={bet.tournament?.name || "No tournament"}
                          >
                            <span>
                              {bet.tournament?.name?.substring(0, 20) || "N/A"}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={bet.player?.name || "No player"}>
                            <span>
                              {bet.player?.name?.substring(0, 15) || "N/A"}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{getBetTypeDisplay(bet.bet_type)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(bet.amount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatOdds(bet.odds)}
                        </TableCell>
                        <TableCell align="right">
                          {bet.potential_payout
                            ? formatCurrency(bet.potential_payout)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={bet.status.toUpperCase()}
                            color={getStatusColor(bet.status) as any}
                            size="small"
                            icon={getStatusIcon(bet.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={profit >= 0 ? "success.main" : "error.main"}
                            fontWeight="bold"
                          >
                            {formatCurrency(profit)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              setMenuAnchor(e.currentTarget);
                              setSelectedBetId(bet.id);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* PERFORMANCE TAB */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
              Performance Insights
            </Typography>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Over Time
                </Typography>
                {prepareChartData().length > 0 ? (
                  <Box sx={{ height: 400, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          label={{
                            value: "Date",
                            position: "insideBottom",
                            offset: -5,
                          }}
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          yAxisId="profit"
                          label={{
                            value: "Profit ($)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                          domain={["dataMin", "dataMax"]}
                        />
                        <YAxis
                          yAxisId="percentage"
                          orientation="right"
                          label={{
                            value: "Win Rate / ROI (%)",
                            angle: 90,
                            position: "insideRight",
                          }}
                        />
                        <RechartsTooltip
                          formatter={(value: any, name: string) => [
                            name === "cumulativeProfit"
                              ? `$${value}`
                              : name === "winRate"
                              ? `${value}%`
                              : name === "roi"
                              ? `${value}%`
                              : value,
                            name === "cumulativeProfit"
                              ? "Cumulative Profit"
                              : name === "winRate"
                              ? "Win Rate"
                              : name === "roi"
                              ? "ROI"
                              : name,
                          ]}
                          labelFormatter={(label: any) => `Date: ${label}`}
                        />
                        <Legend />
                        <ReferenceLine
                          yAxisId="profit"
                          y={0}
                          stroke="#666"
                          strokeDasharray="5 5"
                          label={{
                            value: "Break Even",
                            position: "insideTopRight",
                          }}
                        />
                        <Line
                          yAxisId="profit"
                          type="monotone"
                          dataKey="cumulativeProfit"
                          stroke="#2196f3"
                          strokeWidth={3}
                          name="Cumulative Profit"
                          dot={{ fill: "#2196f3", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          yAxisId="percentage"
                          type="monotone"
                          dataKey="winRate"
                          stroke="#4caf50"
                          strokeWidth={2}
                          name="Win Rate"
                          dot={{ fill: "#4caf50", strokeWidth: 2, r: 3 }}
                        />
                        <Line
                          yAxisId="percentage"
                          type="monotone"
                          dataKey="roi"
                          stroke="#ff9800"
                          strokeWidth={2}
                          name="ROI"
                          dot={{ fill: "#ff9800", strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <TrendingUp
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No settled bets yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Place some bets and settle them to see your performance
                      over time!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bankroll Management Tips
                </Typography>
                <Box>
                  <Typography variant="body2" paragraph>
                    <strong>🎯 Unit Size:</strong> Risk only 1-5% of your total
                    bankroll per bet to protect against devastating losses.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>📊 Value Betting:</strong> Only bet when you believe
                    the odds undervalue the true probability of an outcome.
                  </Typography>
                  <Typography variant="body2">
                    <strong>📈 Record Keeping:</strong> Track every bet with
                    detailed notes to identify patterns and improve
                    decision-making.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bet Type Analysis
                </Typography>
                <Box>
                  {betTypeOptions.map((type) => {
                    const typeBets = bets.filter(
                      (bet) => bet.bet_type === type.value
                    );
                    const wins = typeBets.filter(
                      (bet) => bet.status === "won"
                    ).length;
                    const winRate =
                      typeBets.length > 0
                        ? ((wins / typeBets.length) * 100).toFixed(1)
                        : "0.0";

                    if (typeBets.length === 0) return null;

                    return (
                      <Box
                        key={type.value}
                        display="flex"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography variant="body2">
                          {type.icon} {type.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {typeBets.length} bets ({winRate}% win rate)
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* CONTEXT MENU FOR BET ACTIONS */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuList>
          {selectedBetId &&
            bets.find((bet) => bet.id === selectedBetId)?.status ===
              "pending" && (
              <>
                <MuiMenuItem
                  onClick={() =>
                    selectedBetId && handleUpdateBetStatus(selectedBetId, "won")
                  }
                >
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText>Mark as Won</ListItemText>
                </MuiMenuItem>
                <MuiMenuItem
                  onClick={() =>
                    selectedBetId &&
                    handleUpdateBetStatus(selectedBetId, "lost")
                  }
                >
                  <ListItemIcon>
                    <Cancel color="error" />
                  </ListItemIcon>
                  <ListItemText>Mark as Lost</ListItemText>
                </MuiMenuItem>
                <MuiMenuItem
                  onClick={() =>
                    selectedBetId &&
                    handleUpdateBetStatus(selectedBetId, "pushed")
                  }
                >
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText>Mark as Pushed</ListItemText>
                </MuiMenuItem>
              </>
            )}
          <MuiMenuItem onClick={confirmDeleteBet}>
            <ListItemIcon>
              <Delete color="error" />
            </ListItemIcon>
            <ListItemText>Delete Bet</ListItemText>
          </MuiMenuItem>
        </MenuList>
      </Menu>

      {/* ADD BET DIALOG */}
      <Dialog
        open={addBetOpen}
        onClose={() => setAddBetOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            ...(isMobile && {
              margin: 0,
              maxHeight: "100vh",
              borderRadius: 0,
            }),
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
            <Add sx={{ mr: 1, verticalAlign: "middle" }} />
            Place New Bet
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Bet Date"
                type="date"
                value={betForm.placed_at}
                onChange={(e) =>
                  setBetForm({
                    ...betForm,
                    placed_at: e.target.value,
                  })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tournament (Optional)</InputLabel>
                <Select
                  value={betForm.tournament_id}
                  label="Tournament (Optional)"
                  onChange={(e) =>
                    setBetForm({ ...betForm, tournament_id: e.target.value })
                  }
                >
                  <MenuItem value="">
                    <em>Select Tournament</em>
                  </MenuItem>
                  {tournaments.map((tournament) => (
                    <MenuItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Player (Optional)</InputLabel>
                <Select
                  value={betForm.player_id}
                  label="Player (Optional)"
                  onChange={(e) =>
                    setBetForm({ ...betForm, player_id: e.target.value })
                  }
                >
                  <MenuItem value="">
                    <em>Select Player</em>
                  </MenuItem>
                  {players.map((player) => (
                    <MenuItem key={player.id} value={player.id}>
                      {player.name} {player.country && `(${player.country})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Bet Type</InputLabel>
                <Select
                  value={betForm.bet_type}
                  label="Bet Type"
                  onChange={(e) =>
                    setBetForm({ ...betForm, bet_type: e.target.value })
                  }
                >
                  {betTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Amount Wagered"
                type="number"
                value={betForm.amount}
                onChange={(e) =>
                  setBetForm({ ...betForm, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Odds (American)"
                type="text"
                value={betForm.odds}
                onChange={(e) =>
                  setBetForm({ ...betForm, odds: e.target.value })
                }
                helperText="Enter American odds (e.g., +150, -110)"
                placeholder="+150 or -110"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Potential Payout"
                type="number"
                value={calculatePayout(betForm.amount, betForm.odds)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  readOnly: true,
                }}
                helperText="Calculated automatically from wager and odds"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={2}
                value={betForm.description}
                onChange={(e) =>
                  setBetForm({ ...betForm, description: e.target.value })
                }
                placeholder="Additional notes about this bet..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBetOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddBet}
            variant="contained"
            disabled={loading || !betForm.bet_type || !betForm.amount}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Placing..." : "Place Bet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS NOTIFICATION */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this bet? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBet} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bets;
