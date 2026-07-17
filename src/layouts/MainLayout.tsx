import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
  Tooltip, Divider, useTheme, useMediaQuery, Badge, Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { inventoryHub } from "../signalr/inventoryHub";
import { ErrorBoundary } from "../components/ErrorBoundary";

const DRAWER_WIDTH = 248;
const DRAWER_COLLAPSED = 64;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Products", path: "/products", icon: <InventoryIcon /> },
  { label: "Categories", path: "/categories", icon: <CategoryIcon /> },
  { label: "Suppliers", path: "/suppliers", icon: <PeopleIcon /> },
  { label: "Warehouses", path: "/warehouses", icon: <WarehouseIcon /> },
  { label: "Purchases", path: "/purchases", icon: <ShoppingCartIcon /> },
  { label: "Sales", path: "/sales", icon: <PointOfSaleIcon /> },
  { label: "Transfers", path: "/transfers", icon: <SwapHorizIcon /> },
  { label: "Reports", path: "/reports", icon: <AssessmentIcon /> },
];

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnected] = useState(() => inventoryHub.isConnected);

  const drawerWidth = isMobile ? DRAWER_WIDTH : collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Logo area */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1 : 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2,
            background: "linear-gradient(135deg, #1565C0, #00897B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <InventoryIcon sx={{ fontSize: 20, color: "white" }} />
        </Box>
        {(!collapsed || isMobile) && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>ERP Inventory</Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1}>Management System</Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, px: 1, overflow: "auto" }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: collapsed && !isMobile ? 1.5 : 1.5,
                py: 1,
                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                bgcolor: active ? `${theme.palette.primary.main}18` : "transparent",
                color: active ? "primary.main" : "text.secondary",
                "&:hover": { bgcolor: active ? `${theme.palette.primary.main}22` : "action.hover" },
                "& .MuiListItemIcon-root": {
                  color: active ? "primary.main" : "text.secondary",
                  minWidth: collapsed && !isMobile ? 0 : 40,
                },
              }}
            >
              <Tooltip title={collapsed && !isMobile ? item.label : ""} placement="right">
                <ListItemIcon>{item.icon}</ListItemIcon>
              </Tooltip>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: "0.875rem" }}
                />
              )}
              {active && (!collapsed || isMobile) && (
                <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: "primary.main", ml: "auto" }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom section */}
      <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1 }}>
          <Tooltip title={isConnected ? "Real-time Connected" : "Real-time Disconnected"}>
            {isConnected
              ? <WifiIcon fontSize="small" color="success" />
              : <WifiOffIcon fontSize="small" color="disabled" />}
          </Tooltip>
          {(!collapsed || isMobile) && (
            <Typography variant="caption" color={isConnected ? "success.main" : "text.disabled"}>
              {isConnected ? "Live Updates" : "Offline"}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create("width", { duration: 200 }),
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
              transition: theme.transitions.create("width", { duration: 200 }),
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TopBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed((c) => !c)}
              size="small"
            >
              {collapsed && !isMobile ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>

            <Box sx={{ flex: 1 }} />

            {/* SignalR status chip */}
            <Chip
              size="small"
              icon={isConnected ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
              label={isConnected ? "Live" : "Offline"}
              color={isConnected ? "success" : "default"}
              variant="outlined"
              sx={{ display: { xs: "none", sm: "flex" } }}
            />

            <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton onClick={toggleMode} size="small">
                {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.85rem" }}>
                  {user?.username?.[0]?.toUpperCase() ?? "U"}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => setAnchorEl(null)}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
};
