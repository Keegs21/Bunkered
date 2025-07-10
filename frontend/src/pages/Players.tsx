import React, { useState } from "react";
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh,
  EmojiEvents,
  TrendingUp,
  Analytics,
  Sports,
} from "@mui/icons-material";
import SortableTable, { Column } from "../components/common/SortableTable";
import PlayerDetailModal from "../components/PlayerDetailModal";
import {
  useDataGolfRankings,
  useSkillRatings,
  usePlayerDecompositions,
  useApproachSkill,
} from "../hooks/useDataGolf";

// Removed TabPanel component - using direct conditional rendering for better mobile compatibility

const Players: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Skill ratings controls
  const [skillDisplay, setSkillDisplay] = useState<string>("value");

  // Decompositions controls
  const [decompTour, setDecompTour] = useState<string>("pga");

  // Approach skill controls
  const [approachPeriod, setApproachPeriod] = useState<string>("l24");

  // Utility function to safely get error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error)
      return error.message;
    return "Unknown error occurred";
  };

  const {
    data: playersRankings,
    loading: loadingPlayers,
    error: errorPlayers,
    refetch: refetchPlayers,
  } = useDataGolfRankings();

  const {
    data: skillRatings,
    loading: loadingSkills,
    error: errorSkills,
    refetch: refetchSkills,
  } = useSkillRatings(skillDisplay);

  const {
    data: playerDecompositions,
    loading: loadingDecompositions,
    error: errorDecompositions,
    refetch: refetchDecompositions,
  } = usePlayerDecompositions(decompTour);

  const {
    data: approachSkill,
    loading: loadingApproach,
    error: errorApproach,
    refetch: refetchApproach,
  } = useApproachSkill(approachPeriod);

  // Removed handleTabChange - using inline function for better mobile responsiveness

  const handlePlayerClick = async (player: any) => {
    // Ensure all data is loaded before opening modal
    if (
      !skillRatings ||
      !Array.isArray(skillRatings) ||
      skillRatings.length === 0
    ) {
      await refetchSkills();
    }
    if (
      !playerDecompositions ||
      !Array.isArray(playerDecompositions) ||
      playerDecompositions.length === 0
    ) {
      await refetchDecompositions();
    }
    if (
      !approachSkill ||
      !Array.isArray(approachSkill) ||
      approachSkill.length === 0
    ) {
      await refetchApproach();
    }
    if (
      !playersRankings ||
      !Array.isArray(playersRankings) ||
      playersRankings.length === 0
    ) {
      await refetchPlayers();
    }

    // Find complete player data from rankings to ensure all fields are available
    let completePlayer = player;

    if (playersRankings && playersRankings.length > 0) {
      const rankingPlayer = playersRankings.find((rankPlayer: any) => {
        // Try multiple matching strategies to find the complete player data
        if (
          rankPlayer.dg_id &&
          player.dg_id &&
          rankPlayer.dg_id === player.dg_id
        )
          return true;
        if (
          rankPlayer.player_name &&
          player.player_name &&
          rankPlayer.player_name === player.player_name
        )
          return true;
        // Fallback: case-insensitive name matching
        if (
          rankPlayer.player_name &&
          player.player_name &&
          rankPlayer.player_name.toLowerCase().trim() ===
            player.player_name.toLowerCase().trim()
        )
          return true;
        return false;
      });

      if (rankingPlayer) {
        // Merge the ranking data with the clicked player data to ensure complete information
        completePlayer = {
          ...rankingPlayer, // Complete ranking info (OWGR, DG rank, skill estimate, etc.)
          ...player, // Current tab specific data
          // Ensure critical ranking fields are preserved from rankings data
          datagolf_rank:
            rankingPlayer.datagolf_rank || rankingPlayer.dg_ranking,
          owgr_rank: rankingPlayer.owgr_rank,
          dg_skill_estimate: rankingPlayer.dg_skill_estimate,
          primary_tour: rankingPlayer.primary_tour,
          country: rankingPlayer.country,
          am: rankingPlayer.am,
          recent_events: rankingPlayer.recent_events,
          dg_id: rankingPlayer.dg_id || player.dg_id,
        };
      }
    }

    setSelectedPlayer(completePlayer);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPlayer(null);
  };

  // Define columns for player rankings table with mobile optimization
  const playerColumns: Column[] = [
    {
      id: "datagolf_rank",
      label: "DG Rank",
      minWidth: isMobile ? 70 : 80,
      align: "center",
      format: (value) => {
        if (!value) return "NR";
        return value <= 500 ? value : "NR";
      },
    },
    {
      id: "player_name",
      label: "Player",
      minWidth: isMobile ? 160 : 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            {value
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "?"}
          </Avatar>
          <Box>
            <Typography
              fontWeight="medium"
              fontSize={isMobile ? "0.875rem" : "1rem"}
              sx={{
                cursor: "pointer",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {value}
            </Typography>
            {row?.am && (
              <Chip
                label="Amateur"
                size="small"
                color="info"
                sx={{ mt: 0.5, fontSize: isMobile ? "0.6rem" : "0.75rem" }}
              />
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: "country",
      label: "Country",
      minWidth: isMobile ? 80 : 100,
      align: "center",
      mobileHidden: isSmallMobile,
    },
    {
      id: "dg_skill_estimate",
      label: "Skill Rating",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      format: (value) => {
        if (!value) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0.5
                ? "success.main"
                : num > 0
                ? "success.light"
                : num > -0.5
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(2)}
          </Typography>
        );
      },
    },
    {
      id: "owgr_rank",
      label: "OWGR",
      minWidth: 80,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (!value) return "NR";
        return value;
      },
    },
    {
      id: "primary_tour",
      label: "Tour",
      minWidth: 80,
      align: "center",
      format: (value) => {
        if (!value) return "N/A";
        const tourColors: Record<string, string> = {
          PGA: "primary",
          LIV: "secondary",
          DP: "info",
          KFT: "warning",
        };
        return (
          <Chip
            label={value}
            size="small"
            color={(tourColors[value] as any) || "default"}
            sx={{ fontSize: isMobile ? "0.6rem" : "0.75rem" }}
          />
        );
      },
    },
    // Add a few quick reference stats for comprehensive view
    {
      id: "recent_events",
      label: isMobile ? "Events" : "Recent Events",
      minWidth: isMobile ? 80 : 100,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (!value) return "N/A";
        return value;
      },
    },
  ];

  // Define columns for detailed skill ratings table with mobile optimization
  const skillColumns: Column[] = [
    {
      id: "player_name",
      label: "Player",
      minWidth: isMobile ? 140 : 200,
      format: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            {value
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "?"}
          </Avatar>
          <Typography
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "sg_total",
      label: "SG Total",
      minWidth: isMobile ? 85 : 100,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {skillDisplay === "rank"
              ? `#${value}`
              : `${num >= 0 ? "+" : ""}${num.toFixed(2)}`}
          </Typography>
        );
      },
    },
    {
      id: "sg_ott",
      label: isMobile ? "SG OTT" : "SG Off Tee",
      minWidth: isMobile ? 85 : 100,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {skillDisplay === "rank"
              ? `#${value}`
              : `${num >= 0 ? "+" : ""}${num.toFixed(2)}`}
          </Typography>
        );
      },
    },
    {
      id: "sg_app",
      label: isMobile ? "SG App" : "SG Approach",
      minWidth: isMobile ? 85 : 100,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {skillDisplay === "rank"
              ? `#${value}`
              : `${num >= 0 ? "+" : ""}${num.toFixed(2)}`}
          </Typography>
        );
      },
    },
    {
      id: "sg_arg",
      label: isMobile ? "SG ARG" : "SG Around Green",
      minWidth: isMobile ? 85 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {skillDisplay === "rank"
              ? `#${value}`
              : `${num >= 0 ? "+" : ""}${num.toFixed(2)}`}
          </Typography>
        );
      },
    },
    {
      id: "sg_putt",
      label: isMobile ? "SG Putt" : "SG Putting",
      minWidth: isMobile ? 85 : 100,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {skillDisplay === "rank"
              ? `#${value}`
              : `${num >= 0 ? "+" : ""}${num.toFixed(2)}`}
          </Typography>
        );
      },
    },
    // Add driving accuracy and distance columns
    {
      id: "driving_acc",
      label: isMobile ? "Drv Acc%" : "Driving Accuracy %",
      minWidth: isMobile ? 90 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);

        if (skillDisplay === "rank") {
          return (
            <Typography
              fontWeight="medium"
              fontSize={isMobile ? "0.875rem" : "1rem"}
            >
              #{value}
            </Typography>
          );
        }

        // Handle different data formats for driving accuracy
        let displayValue;
        let colorValue;

        if (Math.abs(num) < 1) {
          // Data appears to be in decimal format (0.655 = 65.5%)
          displayValue = (num * 100).toFixed(1);
          colorValue = num * 100;
        } else {
          // Data is already in percentage format
          displayValue = num.toFixed(1);
          colorValue = num;
        }

        return (
          <Typography
            color={
              colorValue > 0
                ? "success.main"
                : colorValue === 0
                ? "text.primary"
                : "error.main"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {displayValue}%
          </Typography>
        );
      },
    },
    {
      id: "driving_dist",
      label: isMobile ? "Drv Dist" : "Driving Distance",
      minWidth: isMobile ? 85 : 110,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);

        if (skillDisplay === "rank") {
          return (
            <Typography
              fontWeight="medium"
              fontSize={isMobile ? "0.875rem" : "1rem"}
            >
              #{value}
            </Typography>
          );
        }

        // Show as +/- yards from average
        return (
          <Typography
            color={
              num > 10
                ? "success.main"
                : num > 0
                ? "success.light"
                : num > -10
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize={isMobile ? "0.875rem" : "1rem"}
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(0)} yds
          </Typography>
        );
      },
    },
  ];

  // Define columns for player decompositions - comprehensive statistics with compact headers
  const decompositionColumns: Column[] = [
    {
      id: "player_name",
      label: "Player",
      minWidth: isMobile ? 120 : 140,
      format: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
            {value
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "?"}
          </Avatar>
          <Typography fontWeight="medium" fontSize="0.875rem">
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "baseline_pred",
      label: "Baseline",
      minWidth: isMobile ? 75 : 85,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 1.5
                ? "success.main"
                : num > 0.5
                ? "success.light"
                : num > -0.5
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(2)}
          </Typography>
        );
      },
    },
    {
      id: "final_pred",
      label: "Final",
      minWidth: isMobile ? 70 : 80,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 1
                ? "success.main"
                : num > 0
                ? "success.light"
                : num > -1
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(2)}
          </Typography>
        );
      },
    },
    {
      id: "age_adjustment",
      label: isMobile ? "Age" : "Age Adj",
      minWidth: isMobile ? 60 : 70,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "country_adjustment",
      label: isMobile ? "Country" : "Country Adj",
      minWidth: isMobile ? 70 : 85,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "course_experience_adjustment",
      label: isMobile ? "Course Exp" : "Course Experience",
      minWidth: isMobile ? 90 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "driving_accuracy_adjustment",
      label: isMobile ? "Drv Acc" : "Driving Acc",
      minWidth: isMobile ? 75 : 85,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "driving_distance_adjustment",
      label: isMobile ? "Drv Dist" : "Driving Dist",
      minWidth: isMobile ? 75 : 85,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "timing_adjustment",
      label: isMobile ? "Timing" : "Timing Adj",
      minWidth: isMobile ? 70 : 80,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "strokes_gained_category_adjustment",
      label: isMobile ? "SG Cat" : "SG Category",
      minWidth: isMobile ? 75 : 90,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "other_fit_adjustment",
      label: isMobile ? "Other Fit" : "Other Fit",
      minWidth: isMobile ? 80 : 90,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "total_fit_adjustment",
      label: isMobile ? "Total Fit" : "Total Fit Adj",
      minWidth: isMobile ? 85 : 100,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
  ];

  // Define columns for approach skill analysis with mobile optimization
  const approachColumns: Column[] = [
    {
      id: "player_name",
      label: "Player",
      minWidth: isMobile ? 120 : 140,
      format: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
            {value
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "?"}
          </Avatar>
          <Typography fontWeight="medium" fontSize="0.875rem">
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "150_200_fw_sg_per_shot",
      label: isMobile ? "150-200 FW SG" : "150-200 Fairway SG",
      minWidth: isMobile ? 110 : 130,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "150_200_fw_gir_rate",
      label: isMobile ? "150-200 GIR%" : "150-200 GIR Rate",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value) * 100; // Convert to percentage
        return (
          <Typography
            color={
              num > 75
                ? "success.main"
                : num > 60
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num.toFixed(1)}%
          </Typography>
        );
      },
    },
    {
      id: "150_200_fw_proximity_per_shot",
      label: isMobile ? "150-200 Prox" : "150-200 Proximity",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num < 25
                ? "success.main"
                : num < 35
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num.toFixed(1)} ft
          </Typography>
        );
      },
    },
    {
      id: "100_150_fw_sg_per_shot",
      label: isMobile ? "100-150 FW SG" : "100-150 Fairway SG",
      minWidth: isMobile ? 110 : 130,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "100_150_fw_gir_rate",
      label: isMobile ? "100-150 GIR%" : "100-150 GIR Rate",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value) * 100;
        return (
          <Typography
            color={
              num > 80
                ? "success.main"
                : num > 65
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num.toFixed(1)}%
          </Typography>
        );
      },
    },
    {
      id: "50_100_fw_sg_per_shot",
      label: isMobile ? "50-100 FW SG" : "50-100 Fairway SG",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "over_200_fw_sg_per_shot",
      label: isMobile ? "200+ FW SG" : "200+ Fairway SG",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "under_150_rgh_sg_per_shot",
      label: isMobile ? "<150 Rgh SG" : "Rough <150 SG",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "over_150_rgh_sg_per_shot",
      label: isMobile ? "150+ Rgh SG" : "Rough 150+ SG",
      minWidth: isMobile ? 100 : 120,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value);
        return (
          <Typography
            color={
              num > 0 ? "success.main" : num < 0 ? "error.main" : "text.primary"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num >= 0 ? "+" : ""}
            {num.toFixed(3)}
          </Typography>
        );
      },
    },
    {
      id: "under_150_rgh_gir_rate",
      label: isMobile ? "<150 Rgh GIR%" : "Rough <150 GIR%",
      minWidth: isMobile ? 110 : 130,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value) * 100;
        return (
          <Typography
            color={
              num > 60
                ? "success.main"
                : num > 45
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num.toFixed(1)}%
          </Typography>
        );
      },
    },
    {
      id: "over_150_rgh_gir_rate",
      label: isMobile ? "150+ Rgh GIR%" : "Rough 150+ GIR%",
      minWidth: isMobile ? 110 : 130,
      align: "center",
      mobileHidden: isSmallMobile,
      format: (value) => {
        if (value == null) return "N/A";
        const num = Number(value) * 100;
        return (
          <Typography
            color={
              num > 40
                ? "success.main"
                : num > 25
                ? "warning.main"
                : "error.main"
            }
            fontWeight="medium"
            fontSize="0.875rem"
          >
            {num.toFixed(1)}%
          </Typography>
        );
      },
    },
  ];

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchPlayers(),
      refetchSkills(),
      refetchDecompositions(),
      refetchApproach(),
    ]);
  };

  const isRefreshing =
    loadingPlayers || loadingSkills || loadingDecompositions || loadingApproach;

  // Mobile-optimized header component
  const PageHeader = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 2, sm: 0 },
        mb: 3,
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        sx={{ fontWeight: 600 }}
      >
        Player Research
      </Typography>
      {isMobile ? (
        <IconButton
          color="primary"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
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
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefreshAll}
          disabled={isRefreshing}
        >
          Refresh Data
        </Button>
      )}
    </Box>
  );

  // Mobile-optimized filter control component
  const FilterControls = ({
    tabIndex,
    skillDisplay,
    setSkillDisplay,
    decompTour,
    setDecompTour,
    approachPeriod,
    setApproachPeriod,
  }: {
    tabIndex: number;
    skillDisplay: string;
    setSkillDisplay: (value: string) => void;
    decompTour: string;
    setDecompTour: (value: string) => void;
    approachPeriod: string;
    setApproachPeriod: (value: string) => void;
  }) => {
    if (tabIndex === 1) {
      return (
        <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
          <InputLabel>Display</InputLabel>
          <Select
            value={skillDisplay}
            label="Display"
            onChange={(e) => setSkillDisplay(e.target.value)}
          >
            <MenuItem value="value">Values</MenuItem>
            <MenuItem value="rank">Rankings</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (tabIndex === 2) {
      return (
        <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
          <InputLabel>Tour</InputLabel>
          <Select
            value={decompTour}
            label="Tour"
            onChange={(e) => setDecompTour(e.target.value)}
          >
            <MenuItem value="pga">PGA Tour</MenuItem>
            <MenuItem value="euro">European Tour</MenuItem>
            <MenuItem value="opp">Opposite Field</MenuItem>
            <MenuItem value="alt">Alternative</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (tabIndex === 3) {
      return (
        <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={approachPeriod}
            label="Time Period"
            onChange={(e) => setApproachPeriod(e.target.value)}
          >
            <MenuItem value="l24">Last 24 Months</MenuItem>
            <MenuItem value="l12">Last 12 Months</MenuItem>
            <MenuItem value="ytd">Year to Date</MenuItem>
          </Select>
        </FormControl>
      );
    }

    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <PageHeader />

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        aria-label="player tabs"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<EmojiEvents />}
          label={isMobile ? "Rankings" : "Player Rankings"}
          id="player-tab-0"
          aria-controls="player-tabpanel-0"
        />
        <Tab
          icon={<TrendingUp />}
          label={isMobile ? "Skills" : "Skill Ratings"}
          id="player-tab-1"
          aria-controls="player-tabpanel-1"
        />
        <Tab
          icon={<Analytics />}
          label={isMobile ? "Decomp" : "Skill Decompositions"}
          id="player-tab-2"
          aria-controls="player-tabpanel-2"
        />
        <Tab
          icon={<Sports />}
          label={isMobile ? "Approach" : "Approach Analysis"}
          id="player-tab-3"
          aria-controls="player-tabpanel-3"
        />
      </Tabs>

      {/* PLAYER RANKINGS TAB */}
      {tabValue === 0 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Live DataGolf Player Rankings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comprehensive player rankings with skill estimates from DataGolf
                API.
                {!isMobile &&
                  " Click on any player name to view detailed statistics and performance data."}
              </Typography>
            </Box>

            {errorPlayers && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading player rankings: {getErrorMessage(errorPlayers)}
              </Alert>
            )}

            <SortableTable
              columns={playerColumns}
              data={playersRankings || []}
              loading={loadingPlayers}
              searchable={true}
              searchPlaceholder={
                isMobile
                  ? "Search players..."
                  : "Search players by name, country, or tour..."
              }
              defaultSortColumn="datagolf_rank"
              defaultSortDirection="asc"
              onRowClick={handlePlayerClick}
              pagination={true}
              rowsPerPageOptions={isMobile ? [25, 50] : [25, 50, 100]}
              defaultRowsPerPage={isMobile ? 25 : 50}
            />
          </CardContent>
        </Card>
      )}

      {/* SKILL RATINGS TAB */}
      {tabValue === 1 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 0 },
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Comprehensive Skill Ratings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete strokes-gained analysis covering all game skills
                  including driving accuracy and distance data.
                </Typography>
              </Box>
              <FilterControls
                tabIndex={1}
                skillDisplay={skillDisplay}
                setSkillDisplay={setSkillDisplay}
                decompTour={decompTour}
                setDecompTour={setDecompTour}
                approachPeriod={approachPeriod}
                setApproachPeriod={setApproachPeriod}
              />
            </Box>

            {errorSkills && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading skill data: {getErrorMessage(errorSkills)}
              </Alert>
            )}

            <SortableTable
              columns={skillColumns}
              data={skillRatings || []}
              loading={loadingSkills}
              searchable={true}
              searchPlaceholder={
                isMobile ? "Search players..." : "Search by player name..."
              }
              defaultSortColumn="sg_total"
              defaultSortDirection={skillDisplay === "rank" ? "asc" : "desc"}
              onRowClick={handlePlayerClick}
              pagination={true}
              rowsPerPageOptions={isMobile ? [25, 50] : [25, 50, 100]}
              defaultRowsPerPage={isMobile ? 25 : 50}
            />
          </CardContent>
        </Card>
      )}

      {/* SKILL DECOMPOSITIONS TAB */}
      {tabValue === 2 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 0 },
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Advanced Skill Decompositions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive breakdown of performance predictions with
                  detailed adjustments
                  {!isMobile &&
                    " including age, country, course experience, timing, and skill-specific factors"}
                  .
                </Typography>
              </Box>
              <FilterControls
                tabIndex={2}
                skillDisplay={skillDisplay}
                setSkillDisplay={setSkillDisplay}
                decompTour={decompTour}
                setDecompTour={setDecompTour}
                approachPeriod={approachPeriod}
                setApproachPeriod={setApproachPeriod}
              />
            </Box>

            {errorDecompositions && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading decomposition data:{" "}
                {getErrorMessage(errorDecompositions)}
              </Alert>
            )}

            <SortableTable
              columns={decompositionColumns}
              data={playerDecompositions || []}
              loading={loadingDecompositions}
              searchable={true}
              searchPlaceholder={
                isMobile ? "Search players..." : "Search by player name..."
              }
              defaultSortColumn="final_pred"
              defaultSortDirection="desc"
              onRowClick={handlePlayerClick}
              pagination={true}
              rowsPerPageOptions={isMobile ? [25, 50] : [25, 50, 100]}
              defaultRowsPerPage={isMobile ? 25 : 50}
            />
          </CardContent>
        </Card>
      )}

      {/* APPROACH ANALYSIS TAB */}
      {tabValue === 3 && (
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 0 },
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Comprehensive Approach Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Detailed approach performance across all distances and lies
                  {!isMobile &&
                    " including fairway/rough statistics, GIR rates, and proximity data"}
                  .
                </Typography>
              </Box>
              <FilterControls
                tabIndex={3}
                skillDisplay={skillDisplay}
                setSkillDisplay={setSkillDisplay}
                decompTour={decompTour}
                setDecompTour={setDecompTour}
                approachPeriod={approachPeriod}
                setApproachPeriod={setApproachPeriod}
              />
            </Box>

            {errorApproach && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading approach skill data:{" "}
                {getErrorMessage(errorApproach)}
              </Alert>
            )}

            <SortableTable
              columns={approachColumns}
              data={approachSkill || []}
              loading={loadingApproach}
              searchable={true}
              searchPlaceholder={
                isMobile ? "Search players..." : "Search by player name..."
              }
              defaultSortColumn="150_200_fw_sg_per_shot"
              defaultSortDirection="desc"
              onRowClick={handlePlayerClick}
              pagination={true}
              rowsPerPageOptions={isMobile ? [25, 50] : [25, 50, 100]}
              defaultRowsPerPage={isMobile ? 25 : 50}
            />
          </CardContent>
        </Card>
      )}

      {/* Player Detail Modal */}
      <PlayerDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        player={selectedPlayer}
        skillData={skillRatings || undefined}
        decompositionData={playerDecompositions || undefined}
        approachData={approachSkill || undefined}
      />
    </Container>
  );
};

export default Players;
