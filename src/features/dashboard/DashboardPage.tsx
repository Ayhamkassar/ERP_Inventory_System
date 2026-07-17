import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Grid, Card, CardContent, CardHeader, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Skeleton, LinearProgress, Divider,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import InventoryIcon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { dashboardService } from "../../services/dashboardService";
import { inventoryHub } from "../../signalr/inventoryHub";
import { StatCard } from "../../components/StatCard";
import { PageHeader } from "../../components/PageHeader";
import { formatCurrency, formatNumber, formatDateTime } from "../../utils/format";
import { useTheme } from "@mui/material/styles";

const QUERY_KEYS = {
  stats: ["dashboard", "stats"],
  topSelling: ["dashboard", "topSelling"],
  salesPurchases: ["dashboard", "salesPurchases"],
  lowStock: ["dashboard", "lowStock"],
  recent: ["dashboard", "recent"],
};

const statusColor = (status: string): "default" | "success" | "warning" | "error" | "info" => {
  const m: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
    completed: "success", received: "success",
    pending: "warning", in_progress: "info",
    cancelled: "error",
  };
  return m[status] ?? "default";
};

export default function DashboardPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: dashboardService.getStats,
    refetchInterval: 60000,
  });

  const { data: topSelling = [], isLoading: topLoading } = useQuery({
    queryKey: QUERY_KEYS.topSelling,
    queryFn: () => dashboardService.getTopSelling(8),
    refetchInterval: 60000,
  });

  const { data: salesPurchases = [], isLoading: chartLoading } = useQuery({
    queryKey: QUERY_KEYS.salesPurchases,
    queryFn: () => dashboardService.getSalesPurchases(30),
    refetchInterval: 60000,
  });

  const { data: lowStock = [], isLoading: lowStockLoading } = useQuery({
    queryKey: QUERY_KEYS.lowStock,
    queryFn: dashboardService.getLowStock,
    refetchInterval: 30000,
  });

  const { data: recent = [], isLoading: recentLoading } = useQuery({
    queryKey: QUERY_KEYS.recent,
    queryFn: () => dashboardService.getRecentTransactions(8),
    refetchInterval: 30000,
  });

  // SignalR: refresh on stock updates
  useEffect(() => {
    const unsubStock = inventoryHub.onStockUpdated(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recent });
    });
    const unsubLow = inventoryHub.onLowStock(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock });
    });
    return () => { unsubStock(); unsubLow(); };
  }, [queryClient]);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your inventory system"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Total Products"
            value={formatNumber(stats?.totalProducts ?? 0)}
            icon={<InventoryIcon />}
            color={primary}
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Total Warehouses"
            value={formatNumber(stats?.totalWarehouses ?? 0)}
            icon={<WarehouseIcon />}
            color="#7B1FA2"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Total Suppliers"
            value={formatNumber(stats?.totalSuppliers ?? 0)}
            icon={<PeopleIcon />}
            color="#00897B"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Current Stock"
            value={formatNumber(stats?.currentStock ?? 0)}
            subtitle="Total units across all warehouses"
            icon={<StorageIcon />}
            color="#F57C00"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Today's Sales"
            value={formatCurrency(stats?.todaySalesAmount ?? 0)}
            subtitle={`${formatNumber(stats?.todaySales ?? 0)} transactions`}
            icon={<PointOfSaleIcon />}
            color="#2E7D32"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Today's Purchases"
            value={formatCurrency(stats?.todayPurchasesAmount ?? 0)}
            subtitle={`${formatNumber(stats?.todayPurchases ?? 0)} transactions`}
            icon={<ShoppingCartIcon />}
            color="#1565C0"
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Sales vs Purchases chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader title="Sales vs Purchases (30 Days)" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent>
              {chartLoading ? (
                <Skeleton variant="rectangular" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={salesPurchases} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={secondary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={secondary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <RechartTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke={secondary} fill="url(#salesGrad)" strokeWidth={2} name="Sales" />
                    <Area type="monotone" dataKey="purchases" stroke={primary} fill="url(#purchasesGrad)" strokeWidth={2} name="Purchases" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Products */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Top Selling Products" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent>
              {topLoading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={36} sx={{ mb: 1 }} />)
              ) : topSelling.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>No data available</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {topSelling.slice(0, 7).map((p, i) => {
                    const maxQty = topSelling[0]?.totalQuantity ?? 1;
                    const pct = (p.totalQuantity / maxQty) * 100;
                    return (
                      <Box key={p.productId}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: "60%" }}>
                            #{i + 1} {p.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(p.totalQuantity)} units
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock + Recent Transactions */}
      <Grid container spacing={2.5}>
        {/* Low Stock Alert */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardHeader
              title="Low Stock Alerts"
              titleTypographyProps={{ variant: "h6" }}
              avatar={<WarningAmberIcon color="warning" />}
            />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Reorder At</TableCell>
                    <TableCell>Warehouse</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : lowStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No low stock items
                      </TableCell>
                    </TableRow>
                  ) : lowStock.slice(0, 8).map((item) => (
                    <TableRow key={`${item.productId}-${item.warehouseName}`} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{item.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.sku}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.currentStock}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">{item.reorderLevel}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>{item.warehouseName}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardHeader title="Recent Transactions" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reference</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No recent transactions
                      </TableCell>
                    </TableRow>
                  ) : recent.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                          {tx.referenceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          size="small"
                          color={tx.type === "sale" ? "success" : tx.type === "purchase" ? "primary" : "info"}
                          variant="outlined"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{tx.description}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {tx.amount != null ? formatCurrency(tx.amount) : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tx.status} size="small" color={statusColor(tx.status)} sx={{ textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(tx.date)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
