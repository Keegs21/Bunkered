import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  SportsGolf,
  Dashboard,
  EmojiEvents,
  AttachMoney,
  Article,
  People,
  AccountCircle,
  Search,
  ExpandMore,
  Leaderboard,
  Menu as MenuIcon,
  Close,
  Logout,
  Settings,
  SupervisorAccount,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [researchAnchorEl, setResearchAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResearchMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setResearchAnchorEl(event.currentTarget);
  };

  const handleResearchMenuClose = () => {
    setResearchAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    setMobileDrawerOpen(false);
    logout();
    navigate("/login");
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
    handleResearchMenuClose();
    handleMenuClose();
  };

  interface MenuItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    isParent?: boolean;
    isChild?: boolean;
  }

  const navItems: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
    { label: "Leagues", path: "/leagues", icon: <Leaderboard /> },
    { label: "Bets", path: "/bets", icon: <AttachMoney /> },
  ];

  const researchItems: MenuItem[] = [
    { label: "Tournaments", path: "/tournaments", icon: <SportsGolf /> },
    { label: "Players", path: "/players", icon: <People /> },
    { label: "News", path: "/news", icon: <Article /> },
  ];

  const allMenuItems: MenuItem[] = [
    ...navItems,
    { label: "Research", path: "", icon: <Search />, isParent: true },
    ...researchItems.map((item) => ({ ...item, isChild: true })),
  ];

  const isActiveItem = (item: MenuItem) => {
    if (item.path === location.pathname) return true;
    if (
      item.label === "Research" &&
      researchItems.some((r) => r.path === location.pathname)
    )
      return true;
    return false;
  };

  // Mobile Drawer Content
  const drawerContent = (
    <Box sx={{ width: 280, height: "100%" }}>
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SportsGolf sx={{ mr: 1.5, color: "primary.main", fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Bunkered
          </Typography>
        </Box>
        <IconButton onClick={handleMobileDrawerToggle} sx={{ ml: 1 }}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ py: 2 }}>
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
              <AccountCircle />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.first_name || user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        <List sx={{ pt: 2 }}>
          {allMenuItems.map((item) => {
            if (item.isParent) {
              return (
                <React.Fragment key={item.label}>
                  <ListItem sx={{ px: 3, py: 1 }}>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {item.label}
                    </Typography>
                  </ListItem>
                </React.Fragment>
              );
            }

            return (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ px: item.isChild ? 4 : 3 }}
              >
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  selected={isActiveItem(item)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&.Mui-selected": {
                      backgroundColor: "primary.50",
                      color: "primary.main",
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActiveItem(item) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", p: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => handleNavigate("/profile")}
              size="small"
            >
              Profile Settings
            </Button>
            {isAdmin && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SupervisorAccount />}
                onClick={() => handleNavigate("/admin/users")}
                size="small"
                sx={{ color: "primary.main", borderColor: "primary.main" }}
              >
                User Administration
              </Button>
            )}
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              size="small"
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mr: { xs: 0, md: 4 },
            }}
            onClick={() => handleNavigate("/dashboard")}
          >
            <SportsGolf
              sx={{
                mr: 1,
                color: "primary.main",
                fontSize: { xs: 24, md: 28 },
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Bunkered
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1, ml: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "text.primary",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Research Dropdown */}
              <Button
                startIcon={<Search />}
                endIcon={<ExpandMore />}
                onClick={handleResearchMenuOpen}
                sx={{
                  color: researchItems.some(
                    (item) => location.pathname === item.path
                  )
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: researchItems.some(
                    (item) => location.pathname === item.path
                  )
                    ? 600
                    : 400,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Research
              </Button>

              <Menu
                anchorEl={researchAnchorEl}
                open={Boolean(researchAnchorEl)}
                onClose={handleResearchMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                {researchItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      color:
                        location.pathname === item.path
                          ? "primary.main"
                          : "inherit",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {item.icon}
                      {item.label}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Desktop User Menu */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
              <Typography
                variant="body2"
                sx={{ mr: 2, display: { xs: "none", lg: "block" } }}
              >
                Welcome, {user?.first_name || user?.username}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                aria-label="account menu"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
            </Box>
          )}

          {/* Mobile User Avatar */}
          {isMobile && (
            <Box sx={{ ml: "auto" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                <AccountCircle />
              </Avatar>
            </Box>
          )}
        </Toolbar>

        {/* Desktop User Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
            },
          }}
        >
          <MenuItem onClick={() => handleNavigate("/profile")} sx={{ py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Settings fontSize="small" />
              Profile Settings
            </Box>
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => handleNavigate("/admin/users")}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SupervisorAccount fontSize="small" />
                User Administration
              </Box>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.5, color: "error.main" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Logout fontSize="small" />
              Sign Out
            </Box>
          </MenuItem>
        </Menu>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        PaperProps={{
          sx: {
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
