import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

interface Props {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title = "No data found",
  description = "There are no records to display.",
  actionLabel,
  onAction,
  icon,
}) => (
  <Box sx={{ py: 8, textAlign: "center" }}>
    <Box sx={{ mb: 2, color: "text.disabled" }}>
      {icon ?? <InboxIcon sx={{ fontSize: 64 }} />}
    </Box>
    <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>{description}</Typography>
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
    )}
  </Box>
);
