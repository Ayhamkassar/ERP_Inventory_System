import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", p: 3 }}>
      <Paper sx={{ p: 6, textAlign: "center", maxWidth: 440 }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h2" fontWeight={800} color="primary" gutterBottom>404</Typography>
        <Typography variant="h5" fontWeight={600} gutterBottom>Page Not Found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="contained" onClick={() => navigate("/")}>Dashboard</Button>
        </Box>
      </Paper>
    </Box>
  );
}
