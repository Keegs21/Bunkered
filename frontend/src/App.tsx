import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import Players from "./pages/Players";
import Bets from "./pages/Bets";
import Fantasy from "./pages/Fantasy";
import News from "./pages/News";
import Profile from "./pages/Profile";
import Leagues from "./pages/Leagues";
import UserAdministration from "./pages/UserAdministration";
import { useAuth } from "./contexts/AuthContext";

const App: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Enhanced loading screen with mobile optimization
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
          px: 3,
        }}
      >
        <CircularProgress
          size={isMobile ? 48 : 60}
          thickness={4}
          sx={{
            color: "primary.main",
            mb: 3,
          }}
        />
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 500,
            color: "text.primary",
            textAlign: "center",
          }}
        >
          Loading Bunkered...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            mt: 1,
          }}
        >
          Preparing your golf experience
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {user && <Navbar />}

      {/* Main content area with proper mobile spacing */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: user ? { xs: 7, sm: 8 } : 0, // Account for navbar height
          minHeight: user ? "calc(100vh - 56px)" : "100vh",
          "@media (min-width: 600px)": {
            minHeight: user ? "calc(100vh - 64px)" : "100vh",
          },
        }}
      >
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/leagues"
            element={user ? <Leagues /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tournaments"
            element={user ? <Tournaments /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tournaments/:tour/:eventId/:year"
            element={
              user ? <TournamentDetail /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/players"
            element={user ? <Players /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/bets"
            element={user ? <Bets /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/fantasy"
            element={user ? <Fantasy /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/news"
            element={user ? <News /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes */}
          <Route
            path="/admin/users"
            element={
              user ? <UserAdministration /> : <Navigate to="/login" replace />
            }
          />

          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
