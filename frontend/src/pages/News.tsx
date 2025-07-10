import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Article } from "@mui/icons-material";

const News: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          📰 Golf News
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          fontSize={isMobile ? "0.875rem" : "1rem"}
        >
          Latest news and updates from the golf world
        </Typography>
      </Box>

      <Card sx={{ overflow: "hidden" }}>
        <CardContent
          sx={{
            textAlign: "center",
            py: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Article
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: "text.secondary",
              mb: 2,
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Golf News Coming Soon
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 400,
              mx: "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            Stay updated with the latest golf news, tournament reports, and
            player insights
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default News;
