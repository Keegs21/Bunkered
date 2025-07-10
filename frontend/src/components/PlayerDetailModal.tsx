import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  Slide,
} from "@mui/material";
import {
  Close,
  EmojiEvents,
  TrendingUp,
  Public,
  Flag,
  Star,
  SportsGolf,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";

// Mobile slide transition
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PlayerDetailModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  skillData?: any[];
  decompositionData?: any[];
  approachData?: any[];
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  open,
  onClose,
  player,
  skillData,
  decompositionData,
  approachData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!player) return null;

  // Find player-specific data from the arrays with improved matching
  const playerSkillData = skillData?.find((skill) => {
    // Try multiple matching strategies
    if (skill.dg_id && player.dg_id && skill.dg_id === player.dg_id)
      return true;
    if (
      skill.player_name &&
      player.player_name &&
      skill.player_name === player.player_name
    )
      return true;
    // Fallback: case-insensitive name matching
    if (
      skill.player_name &&
      player.player_name &&
      skill.player_name.toLowerCase().trim() ===
        player.player_name.toLowerCase().trim()
    )
      return true;
    return false;
  });

  const playerApproachData = approachData?.find((approach) => {
    // Try multiple matching strategies
    if (approach.dg_id && player.dg_id && approach.dg_id === player.dg_id)
      return true;
    if (
      approach.player_name &&
      player.player_name &&
      approach.player_name === player.player_name
    )
      return true;
    // Fallback: case-insensitive name matching
    if (
      approach.player_name &&
      player.player_name &&
      approach.player_name.toLowerCase().trim() ===
        player.player_name.toLowerCase().trim()
    )
      return true;
    return false;
  });

  const playerDecompositionData = decompositionData?.find((decomp) => {
    // Try multiple matching strategies
    if (decomp.dg_id && player.dg_id && decomp.dg_id === player.dg_id)
      return true;
    if (
      decomp.player_name &&
      player.player_name &&
      decomp.player_name === player.player_name
    )
      return true;
    // Fallback: case-insensitive name matching
    if (
      decomp.player_name &&
      player.player_name &&
      decomp.player_name.toLowerCase().trim() ===
        player.player_name.toLowerCase().trim()
    )
      return true;
    return false;
  });

  const getPlayerInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "??"
    );
  };

  const formatSkillValue = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const getSkillColor = (value: number | null | undefined) => {
    if (value == null) return "text.secondary";
    if (value > 0.5) return "success.main";
    if (value > 0) return "success.light";
    if (value > -0.5) return "warning.main";
    return "error.main";
  };

  const getGIRColor = (value: number | null | undefined) => {
    if (value == null) return "text.secondary";
    if (value > 0.7) return "success.main";
    if (value > 0.6) return "success.light";
    if (value > 0.5) return "warning.main";
    return "error.main";
  };

  const getSkillProgress = (value: number | null | undefined) => {
    if (value == null) return 50;
    // Normalize skill values to 0-100 range (assuming -3 to +3 range)
    return Math.max(0, Math.min(100, ((value + 3) / 6) * 100));
  };

  const getGIRProgress = (value: number | null | undefined) => {
    if (value == null) return 50;
    // Convert GIR rate to percentage for progress bar
    return Math.max(0, Math.min(100, value * 100));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? false : "md"}
      fullWidth={!isMobile}
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Transition : undefined}
      PaperProps={{
        sx: {
          minHeight: isMobile ? "100vh" : "70vh",
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 1,
        }}
      >
        <Avatar
          sx={{
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            mr: { xs: 1.5, sm: 2 },
            bgcolor: "primary.main",
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          {getPlayerInitials(player.player_name)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant={isSmallMobile ? "h6" : "h5"}
            component="div"
            sx={{
              fontSize: { xs: "1.125rem", sm: "1.5rem" },
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {player.player_name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Flag fontSize="small" color="action" />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {player.country || "Unknown"}
            </Typography>
            {player.am && (
              <Chip
                label="Amateur"
                size="small"
                color="info"
                sx={{
                  height: { xs: 24, sm: 28 },
                  fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "grey.500",
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 3 },
          overflow: "auto",
        }}
      >
        <Stack spacing={{ xs: 3, sm: 4 }}>
          {/* Rankings Card */}
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                <EmojiEvents sx={{ mr: 1, color: "primary.main" }} />
                Rankings
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      DataGolf Ranking
                    </Typography>
                    <Typography
                      variant={isSmallMobile ? "h6" : "h5"}
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      {player.datagolf_rank || player.dg_ranking || "NR"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      OWGR Ranking
                    </Typography>
                    <Typography
                      variant={isSmallMobile ? "h6" : "h5"}
                      fontWeight="bold"
                      sx={{ color: "warning.main" }}
                    >
                      {player.owgr_rank || "NR"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Primary Tour
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      {player.primary_tour || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Skill Estimate Card */}
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                <TrendingUp sx={{ mr: 1, color: "success.main" }} />
                Skill Estimate
              </Typography>
              <Box sx={{ textAlign: "center", py: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isSmallMobile ? "h3" : "h2"}
                  sx={{
                    color: getSkillColor(player.dg_skill_estimate),
                    fontWeight: "bold",
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {formatSkillValue(player.dg_skill_estimate)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Strokes gained per round vs field
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getSkillProgress(player.dg_skill_estimate)}
                  sx={{
                    mt: 2,
                    height: { xs: 6, sm: 8 },
                    borderRadius: 4,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getSkillColor(player.dg_skill_estimate),
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Player Information */}
          <Card
            sx={{
              bgcolor: "grey.50",
              borderRadius: { xs: 2, sm: 3 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                <SportsGolf sx={{ mr: 1, color: "info.main" }} />
                Player Information
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 0.5,
                    }}
                  >
                    DataGolf ID
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    {player.dg_id || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 0.5,
                    }}
                  >
                    Amateur Status
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    {player.am ? "Yes" : "No"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 0.5,
                    }}
                  >
                    Last Updated
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    Live Data
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 0.5,
                    }}
                  >
                    Data Source
                  </Typography>
                  <Chip
                    label="DataGolf API"
                    size="small"
                    color="primary"
                    sx={{
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Key Performance Stats */}
          {(playerSkillData ||
            playerApproachData ||
            playerDecompositionData) && (
            <Card
              sx={{
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isSmallMobile ? "subtitle1" : "h6"}
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: 600,
                  }}
                >
                  <Star sx={{ mr: 1, color: "warning.main" }} />
                  Key Performance Statistics
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {/* SG Total */}
                  {playerSkillData?.sg_total != null && (
                    <Grid item xs={12} sm={4}>
                      <Card
                        sx={{
                          bgcolor: "primary.50",
                          borderRadius: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <CardContent
                          sx={{
                            textAlign: "center",
                            p: { xs: 2, sm: 3 },
                            "&:last-child": { pb: { xs: 2, sm: 3 } },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            Strokes Gained Total
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h4" : "h3"}
                            sx={{
                              color: getSkillColor(playerSkillData.sg_total),
                              fontWeight: "bold",
                              fontSize: { xs: "1.75rem", sm: "2.5rem" },
                            }}
                          >
                            {formatSkillValue(playerSkillData.sg_total)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            }}
                          >
                            per round vs field
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getSkillProgress(playerSkillData.sg_total)}
                            sx={{
                              mt: 1,
                              height: { xs: 4, sm: 6 },
                              borderRadius: 3,
                              backgroundColor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getSkillColor(
                                  playerSkillData.sg_total
                                ),
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* 100-150 GIR */}
                  {playerApproachData?.["100_150_fw_gir_rate"] != null && (
                    <Grid item xs={12} sm={4}>
                      <Card
                        sx={{
                          bgcolor: "success.50",
                          borderRadius: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <CardContent
                          sx={{
                            textAlign: "center",
                            p: { xs: 2, sm: 3 },
                            "&:last-child": { pb: { xs: 2, sm: 3 } },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            100-150y GIR Rate
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h4" : "h3"}
                            sx={{
                              color: getGIRColor(
                                playerApproachData["100_150_fw_gir_rate"]
                              ),
                              fontWeight: "bold",
                              fontSize: { xs: "1.75rem", sm: "2.5rem" },
                            }}
                          >
                            {formatPercentage(
                              playerApproachData["100_150_fw_gir_rate"]
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            }}
                          >
                            greens in regulation
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getGIRProgress(
                              playerApproachData["100_150_fw_gir_rate"]
                            )}
                            sx={{
                              mt: 1,
                              height: { xs: 4, sm: 6 },
                              borderRadius: 3,
                              backgroundColor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getGIRColor(
                                  playerApproachData["100_150_fw_gir_rate"]
                                ),
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* SG Putting */}
                  {playerSkillData?.sg_putt != null && (
                    <Grid item xs={12} sm={4}>
                      <Card
                        sx={{
                          bgcolor: "info.50",
                          borderRadius: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <CardContent
                          sx={{
                            textAlign: "center",
                            p: { xs: 2, sm: 3 },
                            "&:last-child": { pb: { xs: 2, sm: 3 } },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            Strokes Gained Putting
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h4" : "h3"}
                            sx={{
                              color: getSkillColor(playerSkillData.sg_putt),
                              fontWeight: "bold",
                              fontSize: { xs: "1.75rem", sm: "2.5rem" },
                            }}
                          >
                            {formatSkillValue(playerSkillData.sg_putt)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            }}
                          >
                            per round vs field
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getSkillProgress(playerSkillData.sg_putt)}
                            sx={{
                              mt: 1,
                              height: { xs: 4, sm: 6 },
                              borderRadius: 3,
                              backgroundColor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getSkillColor(
                                  playerSkillData.sg_putt
                                ),
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>

                {/* Additional Skill Breakdown */}
                {playerSkillData && (
                  <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: 600,
                      }}
                    >
                      Complete Skill Breakdown
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 0.5,
                          }}
                        >
                          SG Off the Tee
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(playerSkillData.sg_ott),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(playerSkillData.sg_ott)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 0.5,
                          }}
                        >
                          SG Approach
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(playerSkillData.sg_app),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(playerSkillData.sg_app)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 0.5,
                          }}
                        >
                          SG Around Green
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(playerSkillData.sg_arg),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(playerSkillData.sg_arg)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 0.5,
                          }}
                        >
                          SG Putting
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(playerSkillData.sg_putt),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(playerSkillData.sg_putt)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Decomposition Data */}
          {playerDecompositionData && (
            <Card
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.main}05 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isSmallMobile ? "subtitle1" : "h6"}
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: 600,
                  }}
                >
                  <TrendingUp sx={{ mr: 1, color: "secondary.main" }} />
                  Performance Predictions
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      Final Prediction
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        color: getSkillColor(
                          playerDecompositionData.final_pred
                        ),
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      }}
                    >
                      {formatSkillValue(playerDecompositionData.final_pred)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      Course Experience
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        color: getSkillColor(
                          playerDecompositionData.course_history_adjustment
                        ),
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      }}
                    >
                      {formatSkillValue(
                        playerDecompositionData.course_history_adjustment
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      Driving Distance
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        color: getSkillColor(
                          playerDecompositionData.driving_distance_adjustment
                        ),
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      }}
                    >
                      {formatSkillValue(
                        playerDecompositionData.driving_distance_adjustment
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      SG Category
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        color: getSkillColor(
                          playerDecompositionData.strokes_gained_category_adjustment
                        ),
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      }}
                    >
                      {formatSkillValue(
                        playerDecompositionData.strokes_gained_category_adjustment
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Approach Skill Analysis */}
          {playerApproachData && (
            <Card
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isSmallMobile ? "subtitle1" : "h6"}
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: 600,
                  }}
                >
                  <SportsGolf sx={{ mr: 1, color: "success.main" }} />
                  Approach Performance Analysis
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Detailed breakdown of approach shots by distance and lie
                  condition
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {/* Short Approach (100-150 yards) */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      100-150 Yard Approaches
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            mb: 0.5,
                          }}
                        >
                          Fairway GIR Rate
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getGIRColor(
                              playerApproachData["100_150_fw_gir_rate"]
                            ),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatPercentage(
                            playerApproachData["100_150_fw_gir_rate"]
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            mb: 0.5,
                          }}
                        >
                          Fairway SG
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(
                              playerApproachData["100_150_fw_sg_per_shot"]
                            ),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(
                            playerApproachData["100_150_fw_sg_per_shot"]
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Medium Approach (150-200 yards) */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      150-200 Yard Approaches
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            mb: 0.5,
                          }}
                        >
                          Fairway GIR Rate
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getGIRColor(
                              playerApproachData["150_200_fw_gir_rate"]
                            ),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatPercentage(
                            playerApproachData["150_200_fw_gir_rate"]
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                            mb: 0.5,
                          }}
                        >
                          Fairway SG
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            color: getSkillColor(
                              playerApproachData["150_200_fw_sg_per_shot"]
                            ),
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          }}
                        >
                          {formatSkillValue(
                            playerApproachData["150_200_fw_sg_per_shot"]
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <Box sx={{ textAlign: "center", py: { xs: 2, sm: 3 } }}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                lineHeight: 1.5,
              }}
            >
              Player statistics powered by DataGolf API • Last updated:{" "}
              {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDetailModal;
