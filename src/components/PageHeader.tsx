import React from "react";
import { Box, Typography, Breadcrumbs, Link as MuiLink, Chip } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, breadcrumbs, badge, actions }) => (
  <Box sx={{ mb: 3 }}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
        {breadcrumbs.map((b, i) =>
          b.href ? (
            <MuiLink key={i} href={b.href} underline="hover" color="inherit" variant="body2">
              {b.label}
            </MuiLink>
          ) : (
            <Typography key={i} variant="body2" color="text.secondary">{b.label}</Typography>
          )
        )}
      </Breadcrumbs>
    )}
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h4" fontWeight={700}>{title}</Typography>
          {badge && <Chip label={badge} size="small" color="primary" variant="outlined" />}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
    </Box>
  </Box>
);
