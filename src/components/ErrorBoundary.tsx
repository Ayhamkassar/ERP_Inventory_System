import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", p: 3 }}>
          <Paper sx={{ p: 5, textAlign: "center", maxWidth: 480 }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
