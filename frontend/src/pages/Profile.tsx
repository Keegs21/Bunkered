import React from "react";
import { Container, Typography, Box, Card, CardContent } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          👤 Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: "center", py: 8 }}>
          <AccountCircle
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.first_name || user?.username}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Email: {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Profile management features coming soon
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
