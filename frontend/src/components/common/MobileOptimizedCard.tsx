import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  IconButton,
  Button,
  Collapse,
  Divider,
  Chip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  MoreVert,
  Share,
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";

export interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  disabled?: boolean;
}

export interface CardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string | React.ReactNode;
  image?: string;
  status?: {
    label: string;
    color?:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "warning"
      | "info"
      | "success";
  };
  metadata?: Array<{
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }>;
  tags?: string[];
  expandedContent?: React.ReactNode;
}

export interface MobileOptimizedCardProps {
  data: CardData;
  actions?: CardAction[];
  onCardClick?: () => void;
  expandable?: boolean;
  defaultExpanded?: boolean;
  favoriteAction?: {
    isFavorited: boolean;
    onToggle: () => void;
  };
  bookmarkAction?: {
    isBookmarked: boolean;
    onToggle: () => void;
  };
  shareAction?: () => void;
  elevation?: number;
  variant?: "outlined" | "elevation";
  className?: string;
}

/**
 * MobileOptimizedCard - A comprehensive card component optimized for mobile devices
 *
 * Features:
 * - Touch-friendly interactions with proper target sizes
 * - Responsive design that adapts to screen size
 * - Expandable content with smooth animations
 * - Quick actions (favorite, bookmark, share)
 * - Professional visual hierarchy
 * - Accessibility support
 *
 * @example
 * ```tsx
 * const playerData: CardData = {
 *   id: "player-1",
 *   title: "Tiger Woods",
 *   subtitle: "PGA Tour Pro",
 *   description: "15-time Major Championship winner",
 *   avatar: "/avatars/tiger.jpg",
 *   status: { label: "Active", color: "success" },
 *   metadata: [
 *     { label: "World Ranking", value: "#15", icon: <EmojiEvents /> },
 *     { label: "Strokes Gained", value: "+1.2", icon: <TrendingUp /> }
 *   ],
 *   tags: ["Major Winner", "Hall of Fame"]
 * };
 *
 * <MobileOptimizedCard
 *   data={playerData}
 *   expandable
 *   onCardClick={() => navigate(`/players/${playerData.id}`)}
 *   favoriteAction={{
 *     isFavorited: true,
 *     onToggle: () => toggleFavorite(playerData.id)
 *   }}
 *   actions={[
 *     { label: "View Stats", onClick: () => openStats() },
 *     { label: "Place Bet", onClick: () => openBetting(), variant: "contained" }
 *   ]}
 * />
 * ```
 */
const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  data,
  actions = [],
  onCardClick,
  expandable = false,
  defaultExpanded = false,
  favoriteAction,
  bookmarkAction,
  shareAction,
  elevation = 2,
  variant = "elevation",
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [rippleEffect, setRippleEffect] = useState(false);

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      // Add visual feedback for touch
      setRippleEffect(true);
      setTimeout(() => setRippleEffect(false), 200);
      onCardClick();
    }
  };

  const handleActionClick = (action: CardAction, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!action.disabled) {
      action.onClick();
    }
  };

  const hasQuickActions = favoriteAction || bookmarkAction || shareAction;
  const hasExpandableContent =
    expandable && (data.expandedContent || data.metadata);

  return (
    <Card
      elevation={variant === "elevation" ? elevation : 0}
      variant={variant}
      className={className}
      onClick={onCardClick ? handleCardClick : undefined}
      sx={{
        cursor: onCardClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        overflow: "visible",

        // Mobile-optimized hover effects
        "&:hover": onCardClick
          ? {
              transform: isMobile ? "none" : "translateY(-2px)",
              boxShadow: isMobile ? undefined : theme.shadows[8],
            }
          : {},

        // Touch feedback
        "&:active": onCardClick
          ? {
              transform: "scale(0.98)",
            }
          : {},

        // Ripple effect for mobile
        ...(rippleEffect && {
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: alpha(theme.palette.primary.main, 0.1),
            borderRadius: "inherit",
            animation: "ripple 0.2s ease-out",
          },
        }),

        // Responsive margins
        mb: { xs: 2, sm: 2, md: 3 },
        mx: { xs: 0, sm: 0, md: 0 },
      }}
    >
      <CardContent
        sx={{
          padding: { xs: 2, sm: 3 },
          paddingBottom:
            actions.length > 0 ? { xs: 1, sm: 2 } : { xs: 2, sm: 3 },
          "&:last-child": {
            paddingBottom:
              actions.length > 0 ? { xs: 1, sm: 2 } : { xs: 2, sm: 3 },
          },
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          {/* Avatar */}
          {data.avatar && (
            <Box sx={{ mr: 2, flexShrink: 0 }}>
              {typeof data.avatar === "string" ? (
                <Avatar
                  src={data.avatar}
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                  }}
                >
                  {data.title.charAt(0)}
                </Avatar>
              ) : (
                data.avatar
              )}
            </Box>
          )}

          {/* Title and Subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Typography
                variant={isSmallMobile ? "h6" : "h5"}
                component="h3"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {data.title}
              </Typography>

              {data.status && (
                <Chip
                  label={data.status.label}
                  color={data.status.color}
                  size="small"
                  sx={{
                    ml: 1,
                    height: { xs: 24, sm: 28 },
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>

            {data.subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {data.subtitle}
              </Typography>
            )}
          </Box>

          {/* Quick Actions */}
          {hasQuickActions && (
            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
              {favoriteAction && (
                <IconButton
                  size={isMobile ? "medium" : "small"}
                  onClick={(e) => {
                    e.stopPropagation();
                    favoriteAction.onToggle();
                  }}
                  sx={{
                    color: favoriteAction.isFavorited
                      ? "error.main"
                      : "text.secondary",
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                  }}
                  aria-label={
                    favoriteAction.isFavorited
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  {favoriteAction.isFavorited ? (
                    <Favorite />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
              )}

              {bookmarkAction && (
                <IconButton
                  size={isMobile ? "medium" : "small"}
                  onClick={(e) => {
                    e.stopPropagation();
                    bookmarkAction.onToggle();
                  }}
                  sx={{
                    color: bookmarkAction.isBookmarked
                      ? "primary.main"
                      : "text.secondary",
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                  }}
                  aria-label={
                    bookmarkAction.isBookmarked
                      ? "Remove bookmark"
                      : "Add bookmark"
                  }
                >
                  {bookmarkAction.isBookmarked ? (
                    <Bookmark />
                  ) : (
                    <BookmarkBorder />
                  )}
                </IconButton>
              )}

              {shareAction && (
                <IconButton
                  size={isMobile ? "medium" : "small"}
                  onClick={(e) => {
                    e.stopPropagation();
                    shareAction();
                  }}
                  sx={{
                    color: "text.secondary",
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                  }}
                  aria-label="Share"
                >
                  <Share />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        {/* Description */}
        {data.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.5,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {data.description}
          </Typography>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {data.tags.slice(0, isSmallMobile ? 3 : 5).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  height: { xs: 24, sm: 28 },
                }}
              />
            ))}
            {data.tags.length > (isSmallMobile ? 3 : 5) && (
              <Chip
                label={`+${data.tags.length - (isSmallMobile ? 3 : 5)} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  height: { xs: 24, sm: 28 },
                  color: "text.secondary",
                }}
              />
            )}
          </Stack>
        )}

        {/* Metadata Preview (only show on desktop or when not expandable) */}
        {data.metadata && (!isMobile || !hasExpandableContent) && (
          <Box sx={{ mb: hasExpandableContent ? 0 : 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 3 }}
              divider={
                !isMobile ? (
                  <Divider orientation="vertical" flexItem />
                ) : undefined
              }
            >
              {data.metadata.slice(0, isMobile ? 2 : 4).map((item, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {item.icon && (
                    <Box sx={{ color: "text.secondary" }}>{item.icon}</Box>
                  )}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Expand Button */}
        {hasExpandableContent && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              size="small"
              onClick={handleExpandClick}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                minHeight: { xs: 40, sm: 36 },
              }}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
          </Box>
        )}

        {/* Expandable Content */}
        {hasExpandableContent && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              {/* Expanded Metadata */}
              {data.metadata && (
                <Box sx={{ mb: data.expandedContent ? 2 : 0 }}>
                  <Stack spacing={2}>
                    {data.metadata.map((item, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {item.icon && (
                          <Box sx={{ color: "text.secondary", minWidth: 24 }}>
                            {item.icon}
                          </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              fontSize: "0.75rem",
                              lineHeight: 1.2,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              mt: 0.5,
                            }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Custom Expanded Content */}
              {data.expandedContent && <Box>{data.expandedContent}</Box>}
            </Box>
          </Collapse>
        )}
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && (
        <CardActions
          sx={{
            padding: { xs: 2, sm: 3 },
            paddingTop: 0,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 1 },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "text"}
              color={action.color || "primary"}
              disabled={action.disabled}
              startIcon={action.icon}
              onClick={(e) => handleActionClick(action, e)}
              fullWidth={isMobile}
              sx={{
                minHeight: { xs: 44, sm: 36 },
                fontSize: { xs: "0.875rem", sm: "0.8125rem" },
                ...(index === 0 &&
                  isMobile && {
                    variant: action.variant || "contained",
                  }),
              }}
            >
              {action.label}
            </Button>
          ))}
        </CardActions>
      )}

      {/* Ripple Animation */}
      <style>
        {`
          @keyframes ripple {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            50% {
              opacity: 0.3;
            }
            100% {
              opacity: 0;
              transform: scale(1);
            }
          }
        `}
      </style>
    </Card>
  );
};

export default MobileOptimizedCard;
