import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Refresh, EmojiEvents, Schedule } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SortableTable, { Column } from "../components/common/SortableTable";
import {
  useRecentTournaments,
  useTournamentSchedule,
  usePreTournamentPredictions,
} from "../hooks/useDataGolf";

// Removed TabPanel component - using direct conditional rendering for better mobile compatibility

const Tournaments: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState(0);
  const [selectedTour, setSelectedTour] = useState("pga");
  const navigate = useNavigate();

  const {
    data: recentTournaments,
    loading: loadingRecent,
    error: errorRecent,
    refetch: refetchRecent,
  } = useRecentTournaments(selectedTour, 25);

  const {
    data: schedule,
    loading: loadingSchedule,
    error: errorSchedule,
    refetch: refetchSchedule,
  } = useTournamentSchedule("all");

  // Fetch pre-tournament predictions for different tours
  const {
    data: pgaPredictions,
    loading: loadingPgaPredictions,
    error: errorPgaPredictions,
  } = usePreTournamentPredictions("pga", "percent");

  const {
    data: euroPredictions,
    loading: loadingEuroPredictions,
    error: errorEuroPredictions,
  } = usePreTournamentPredictions("euro", "percent");

  const {
    data: kftPredictions,
    loading: loadingKftPredictions,
    error: errorKftPredictions,
  } = usePreTournamentPredictions("kft", "percent");

  // Process predictions data to match with tournaments
  const allPredictions = useMemo(() => {
    const predictions: any = {};

    // Process PGA predictions
    if (pgaPredictions?.baseline) {
      predictions.pga = pgaPredictions.baseline;
    }

    // Process Euro predictions
    if (euroPredictions?.baseline) {
      predictions.euro = euroPredictions.baseline;
    }

    // Process KFT predictions
    if (kftPredictions?.baseline) {
      predictions.kft = kftPredictions.baseline;
    }

    return predictions;
  }, [pgaPredictions, euroPredictions, kftPredictions]);

  // Helper function to identify opposite field events
  const isOppositeFieldEvent = (eventName: string) => {
    const oppositeFieldEvents = [
      "ISCO Championship",
      "Barbasol Championship",
      "Barracuda Championship",
      "Corales Puntacana",
      "Puerto Rico Open",
      "Myrtle Beach Classic",
      "ONEflight Myrtle Beach Classic",
      "Rocket Mortgage Classic", // When opposite to a major
      "3M Open", // Sometimes opposite field
      "Wyndham Championship", // Last regular season event
    ];

    return oppositeFieldEvents.some((opp) =>
      eventName.toLowerCase().includes(opp.toLowerCase())
    );
  };

  // Helper function to get top 3 predictions for a tournament
  const getTop3Predictions = (
    tour: string,
    tournamentStartDate: string,
    eventName: string
  ) => {
    // Don't show predictions for opposite field events
    // These events have different fields and the main tour predictions don't apply
    if (isOppositeFieldEvent(eventName)) {
      return [];
    }

    const tourPredictions = allPredictions[tour];
    if (!tourPredictions || !Array.isArray(tourPredictions)) {
      return [];
    }

    // Only show predictions for the soonest upcoming main tour tournament
    // Find the soonest upcoming non-opposite field tournament for this tour
    const soonestMainTournament = upcomingTournaments
      .filter(
        (t: any) =>
          t.tour === tour && t.start_date && !isOppositeFieldEvent(t.event_name)
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )[0];

    // If this tournament is not the soonest main tour event, don't show predictions
    if (
      !soonestMainTournament ||
      soonestMainTournament.start_date !== tournamentStartDate
    ) {
      return [];
    }

    // Sort by win probability and take top 3
    return tourPredictions
      .sort((a: any, b: any) => (b.win || 0) - (a.win || 0))
      .slice(0, 3);
  };

  // Process schedule data to separate live, upcoming, and historical tournaments
  const { liveTournaments, upcomingTournaments } = useMemo(() => {
    if (!schedule?.schedule) {
      return { liveTournaments: [], upcomingTournaments: [] };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for proper comparison

    const live: any[] = [];
    const upcoming: any[] = [];

    schedule.schedule.forEach((tournament: any) => {
      if (!tournament.start_date) {
        upcoming.push(tournament); // Include tournaments with TBD dates as upcoming
        return;
      }

      const startDate = new Date(tournament.start_date);
      startDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

      let endDate = tournament.end_date ? new Date(tournament.end_date) : null;

      // If no end date provided, estimate 4 days for typical golf tournament
      if (!endDate) {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 3); // Thursday to Sunday (4 days total)
      }

      if (endDate) {
        endDate.setHours(23, 59, 59, 999); // Set to end of day for comparison
      }

      // Check if tournament is currently happening (live)
      if (endDate && startDate <= now && endDate >= now) {
        live.push(tournament);
      }
      // Check if tournament hasn't started yet (upcoming)
      else if (startDate > now) {
        upcoming.push(tournament);
      }
      // Tournaments that have ended are filtered out (historical)
      else {
      }
    });

    // Sort live tournaments - PGA first, then by start date (most recent first)
    live.sort((a: any, b: any) => {
      // Prioritize PGA tournaments
      if (a.tour === "pga" && b.tour !== "pga") return -1;
      if (a.tour !== "pga" && b.tour === "pga") return 1;

      // If both are same tour type, sort by start date (most recent first)
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return dateB.getTime() - dateA.getTime();
    });

    // Sort upcoming tournaments by start date (soonest first)
    upcoming.sort((a: any, b: any) => {
      // Handle TBD dates - put them at the end
      if (!a.start_date && !b.start_date) return 0;
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;

      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return dateA.getTime() - dateB.getTime();
    });

    return { liveTournaments: live, upcomingTournaments: upcoming };
  }, [schedule]);

  // Removed handleTabChange - using inline function for better mobile responsiveness

  const handleTournamentClick = (tournament: any) => {
    navigate(
      `/tournaments/${tournament.tour}/${tournament.event_id}/${tournament.calendar_year}`
    );
  };

  const handleScheduleTournamentClick = (tournament: any) => {
    // For schedule tournaments, we need to extract year from start_date
    const year = tournament.start_date
      ? new Date(tournament.start_date).getFullYear()
      : new Date().getFullYear();
    navigate(`/tournaments/pga/${tournament.event_id}/${year}`);
  };

  // Define columns for recent tournaments table with mobile optimization
  const recentTournamentColumns: Column[] = [
    {
      id: "event_name",
      label: "Tournament",
      minWidth: isMobile ? 150 : 200,
      format: (value) => (
        <Typography
          fontWeight="medium"
          fontSize={isMobile ? "0.875rem" : "1rem"}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: isMobile ? 2 : 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "calendar_year",
      label: "Year",
      minWidth: isMobile ? 60 : 80,
      align: "center",
      mobileHidden: isSmallMobile,
    },
    {
      id: "tour",
      label: "Tour",
      minWidth: isMobile ? 70 : 80,
      align: "center",
      format: (value) => (
        <Chip
          label={value?.toUpperCase()}
          size="small"
          color={
            value === "pga"
              ? "primary"
              : value === "euro"
              ? "secondary"
              : "default"
          }
          sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      minWidth: isMobile ? 100 : 120,
      format: (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        return (
          <Typography fontSize={isMobile ? "0.875rem" : "1rem"}>
            {isMobile
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : date.toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      id: "event_id",
      label: "Event ID",
      minWidth: 100,
      align: "center",
      mobileHidden: true, // Always hide on mobile
    },
  ];

  // Define columns for schedule table with mobile optimization
  const scheduleColumns: Column[] = [
    {
      id: "event_name",
      label: "Tournament",
      minWidth: isMobile ? 140 : 200,
      format: (value) => (
        <Typography
          fontWeight="medium"
          fontSize={isMobile ? "0.875rem" : "1rem"}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: isMobile ? 2 : 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: isMobile ? 90 : 100,
      align: "center",
      format: (_value, row) => {
        if (!row?.start_date) {
          return (
            <Chip
              label="TBD"
              size="small"
              color="default"
              sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
            />
          );
        }

        const now = new Date();
        const startDate = new Date(row.start_date);
        const endDate = row.end_date ? new Date(row.end_date) : null;

        // Calculate days until start
        const daysUntilStart = Math.ceil(
          (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Note: Live tournaments are now handled separately and won't appear in this table

        // Check if tournament starts this week (within 7 days)
        if (daysUntilStart <= 7 && daysUntilStart > 0) {
          return (
            <Chip
              label={isMobile ? "This Week" : "This Week"}
              size="small"
              color="warning"
              sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
            />
          );
        }

        // Check if tournament starts today or tomorrow
        if (daysUntilStart <= 1 && daysUntilStart >= 0) {
          return (
            <Chip
              label={isMobile ? "Soon" : "Starting Soon"}
              size="small"
              color="error"
              sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
            />
          );
        }

        // Future tournament
        if (daysUntilStart > 7) {
          return (
            <Chip
              label="Upcoming"
              size="small"
              color="primary"
              sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
            />
          );
        }

        return (
          <Chip
            label="Upcoming"
            size="small"
            color="default"
            sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
          />
        );
      },
    },
    {
      id: "tour",
      label: "Tour",
      minWidth: isMobile ? 70 : 100,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => (
        <Chip
          label={value?.toUpperCase() || "PGA"}
          size="small"
          color={
            value === "pga"
              ? "primary"
              : value === "euro"
              ? "secondary"
              : value === "kft"
              ? "info"
              : value === "liv"
              ? "warning"
              : "default"
          }
          sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
        />
      ),
    },
    {
      id: "start_date",
      label: "Start Date",
      minWidth: isMobile ? 100 : 120,
      format: (value) => {
        if (!value) return "TBD";
        const date = new Date(value);
        return (
          <Typography fontSize={isMobile ? "0.875rem" : "1rem"}>
            {isMobile
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : date.toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      id: "predictions",
      label: isMobile ? "Top 3" : "Top 3 Predictions",
      minWidth: isMobile ? 140 : 200,
      mobileHidden: isSmallMobile, // Hide on small mobile to save space
      format: (_value, row) => {
        const tour = row?.tour || "pga";
        const startDate = row?.start_date;
        const eventName = row?.event_name || "";
        const top3 = getTop3Predictions(tour, startDate, eventName);

        if (top3.length === 0) {
          return (
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize={isMobile ? "0.75rem" : "0.875rem"}
            >
              No predictions
            </Typography>
          );
        }

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 0.25 : 0.5,
            }}
          >
            {top3.map((player: any, index: number) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 0.5 : 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: "16px",
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.7rem" : "0.875rem",
                  }}
                >
                  {index + 1}.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontSize: isMobile ? "0.65rem" : "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {player.player_name || "Unknown"}
                </Typography>
                <Chip
                  label={`${((player.win || 0) * 100).toFixed(1)}%`}
                  size="small"
                  color={
                    index === 0
                      ? "success"
                      : index === 1
                      ? "warning"
                      : "default"
                  }
                  sx={{
                    fontSize: isMobile ? "0.6rem" : "0.7rem",
                    height: isMobile ? "18px" : "20px",
                  }}
                />
              </Box>
            ))}
          </Box>
        );
      },
    },
  ];

  const tourOptions = [
    { value: "pga", label: isMobile ? "PGA" : "PGA Tour" },
    { value: "euro", label: isMobile ? "DP World" : "DP World Tour" },
    { value: "kft", label: isMobile ? "KFT" : "Korn Ferry Tour" },
    { value: "liv", label: isMobile ? "LIV" : "LIV Golf" },
  ];

  // Mobile-optimized header component
  const PageHeader = () => (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        🏆 Tournaments
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        fontSize={isMobile ? "0.875rem" : "1rem"}
      >
        {isMobile
          ? "View recent results and upcoming schedules"
          : "View recent tournament results and upcoming tournament schedules from DataGolf"}
      </Typography>
    </Box>
  );

  // Mobile-optimized tour selection component
  const TourSelection = () => (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Typography variant="h6" sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
        Recent Tournaments
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: { xs: "flex-start", sm: "flex-start" },
        }}
      >
        {tourOptions.map((tour) => (
          <Chip
            key={tour.value}
            label={tour.label}
            variant={selectedTour === tour.value ? "filled" : "outlined"}
            color={selectedTour === tour.value ? "primary" : "default"}
            onClick={() => setSelectedTour(tour.value)}
            clickable
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
          />
        ))}
      </Box>
      {isMobile ? (
        <IconButton
          color="primary"
          onClick={refetchRecent}
          disabled={loadingRecent}
          sx={{
            alignSelf: "flex-end",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "action.disabled" },
          }}
        >
          <Refresh />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={refetchRecent}
          disabled={loadingRecent}
        >
          Refresh
        </Button>
      )}
    </Box>
  );

  // Live tournaments section component
  const LiveTournamentsSection = () => {
    // Temporary debug info when no live tournaments
    if (liveTournaments.length === 0) {
      return (
        <Card
          sx={{ mb: 3, border: "1px dashed", borderColor: "text.disabled" }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6" color="text.secondary">
                No Live Tournaments
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              No tournaments are currently in progress. Check the browser
              console for debugging information.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 3, border: "2px solid", borderColor: "success.main" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Chip
              label="LIVE"
              color="success"
              variant="filled"
              size="small"
              sx={{
                fontWeight: "bold",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.7,
                  },
                  "100%": {
                    opacity: 1,
                  },
                },
              }}
            />
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Live Tournaments ({liveTournaments.length})
            </Typography>
          </Box>

          <Stack spacing={2}>
            {liveTournaments.map((tournament: any) => (
              <Card
                key={`${tournament.event_id}-${tournament.tour}`}
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 2,
                    borderColor: "success.main",
                  },
                }}
                onClick={() => handleScheduleTournamentClick(tournament)}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography
                        variant="h6"
                        fontSize="1.1rem"
                        fontWeight="medium"
                      >
                        {tournament.event_name}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip
                          label={tournament.tour?.toUpperCase()}
                          size="small"
                          color={
                            tournament.tour === "pga"
                              ? "primary"
                              : tournament.tour === "euro"
                              ? "secondary"
                              : "default"
                          }
                        />
                        {tournament.start_date && tournament.end_date && (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(
                              tournament.start_date
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(tournament.end_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label="View Leaderboard"
                        color="success"
                        variant="outlined"
                        clickable
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Mobile-optimized schedule header component
  const ScheduleHeader = () => (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Typography variant="h6" sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
        Upcoming Tournament Schedule
      </Typography>
      {isMobile ? (
        <IconButton
          color="primary"
          onClick={refetchSchedule}
          disabled={loadingSchedule}
          sx={{
            alignSelf: "flex-end",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "action.disabled" },
          }}
        >
          <Refresh />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={refetchSchedule}
          disabled={loadingSchedule}
        >
          Refresh
        </Button>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <PageHeader />

      <LiveTournamentsSection />

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        aria-label="tournament tabs"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<EmojiEvents />}
          label={isMobile ? "Recent" : "Recent Tournaments"}
          id="tournament-tab-0"
          aria-controls="tournament-tabpanel-0"
        />
        <Tab
          icon={<Schedule />}
          label={isMobile ? "Schedule" : "Tournament Schedule"}
          id="tournament-tab-1"
          aria-controls="tournament-tabpanel-1"
        />
      </Tabs>

      {/* RECENT TOURNAMENTS TAB */}
      {tabValue === 0 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <TourSelection />

            {errorRecent && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading recent tournaments: {errorRecent}
              </Alert>
            )}

            <SortableTable
              columns={recentTournamentColumns}
              data={recentTournaments || []}
              loading={loadingRecent}
              searchPlaceholder={
                isMobile ? "Search..." : "Search tournaments..."
              }
              defaultSortColumn="calendar_year"
              defaultSortDirection="desc"
              onRowClick={handleTournamentClick}
              pagination={true}
              rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 50]}
              defaultRowsPerPage={isMobile ? 10 : 25}
            />
          </CardContent>
        </Card>
      )}

      {/* TOURNAMENT SCHEDULE TAB */}
      {tabValue === 1 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <ScheduleHeader />

            {errorSchedule && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading schedule: {errorSchedule}
              </Alert>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: isMobile ? "0.8rem" : "0.875rem" }}
            >
              {isMobile
                ? "Future tournaments starting soon."
                : "Future tournaments starting soon are shown first. Live tournaments are shown above. Historical tournaments are available in the Recent Tournaments tab."}
            </Typography>

            <SortableTable
              columns={scheduleColumns}
              data={upcomingTournaments}
              loading={loadingSchedule}
              searchPlaceholder={
                isMobile ? "Search..." : "Search upcoming tournaments..."
              }
              defaultSortColumn="start_date"
              defaultSortDirection="asc"
              onRowClick={handleScheduleTournamentClick}
              title={`Upcoming Tournaments (${upcomingTournaments.length})`}
              pagination={true}
              rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 50]}
              defaultRowsPerPage={isMobile ? 10 : 25}
            />
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Tournaments;
