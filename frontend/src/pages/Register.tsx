import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Grid,
} from "@mui/material";
import { SportsGolf } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    referral_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        referral_code: formData.referral_code,
      });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 540, md: 600 },
          mx: "auto",
          boxShadow: { xs: 2, sm: 8 },
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            "&:last-child": { pb: { xs: 3, sm: 4, md: 5 } },
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
            <SportsGolf
              sx={{
                fontSize: { xs: 40, sm: 48, md: 56 },
                color: "primary.main",
                mb: { xs: 1.5, sm: 2 },
              }}
            />
            <Typography
              variant={isSmallMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                lineHeight: 1.2,
              }}
            >
              Join Bunkered
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
                maxWidth: { xs: "100%", sm: 450 },
                mx: "auto",
              }}
            >
              Create your account to start tracking golf statistics and betting
              performance
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: { xs: 1, sm: 2 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              {/* Name Fields */}
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="given-name"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 56, sm: 48 },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="family-name"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 56, sm: 48 },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Username Field */}
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                sx={{
                  "& .MuiInputBase-root": {
                    height: { xs: 56, sm: 48 },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                  },
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                sx={{
                  "& .MuiInputBase-root": {
                    height: { xs: 56, sm: 48 },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                  },
                }}
              />

              {/* Password Fields */}
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 56, sm: 48 },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 56, sm: 48 },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referral Code"
                    name="referral_code"
                    value={formData.referral_code}
                    onChange={handleChange}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 56, sm: 48 },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "16px", sm: "1rem" }, // Prevents zoom on iOS
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  height: { xs: 52, sm: 48 },
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  fontWeight: 600,
                  borderRadius: { xs: 2, sm: 2.5 },
                  textTransform: "none",
                  mt: { xs: 2, sm: 3 },
                  boxShadow: loading ? 0 : 2,
                  "&:hover": {
                    boxShadow: loading ? 0 : 4,
                  },
                  "&:disabled": {
                    bgcolor: "action.disabled",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{ color: "white" }}
                  />
                ) : (
                  "Create Account"
                )}
              </Button>
            </Stack>
          </Box>

          {/* Sign In Link */}
          <Box sx={{ textAlign: "center", mt: { xs: 3, sm: 4 } }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: "text.secondary",
              }}
            >
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
