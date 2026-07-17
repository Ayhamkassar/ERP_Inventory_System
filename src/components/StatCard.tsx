import React from "react";
import { Card, CardContent, Box, Typography, Skeleton, Avatar } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
  loading?: boolean;
}

export const StatCard: React.FC<Props> = ({ title, value, subtitle, icon, color = "#1565C0", trend, loading }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            {title}
          </Typography>
          {loading ? (
            <>
              <Skeleton variant="text" width={120} height={40} />
              <Skeleton variant="text" width={80} />
            </>
          ) : (
            <>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
              )}
            </>
          )}
          {trend !== undefined && !loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              {trend >= 0
                ? <TrendingUpIcon fontSize="small" color="success" />
                : <TrendingDownIcon fontSize="small" color="error" />}
              <Typography variant="caption" color={trend >= 0 ? "success.main" : "error.main"} fontWeight={600}>
                {Math.abs(trend)}% vs yesterday
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}18`, width: 52, height: 52 }}>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);
