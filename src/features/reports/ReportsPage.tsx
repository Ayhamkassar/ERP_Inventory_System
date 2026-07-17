import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Grid, Typography, TextField, MenuItem,
  Button, Tab, Tabs, Table, TableBody, TableCell, TableHead,
  TableRow, Skeleton, Divider, Chip, CircularProgress,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles";
import { reportService } from "../../services/reportService";
import { categoryService } from "../../services/categoryService";
import { supplierService } from "../../services/supplierService";
import { warehouseService } from "../../services/warehouseService";
import { productService } from "../../services/productService";
import { PageHeader } from "../../components/PageHeader";
import { getErrorMessage } from "../../api/client";
import { formatCurrency, formatDate, formatNumber, downloadBlob } from "../../utils/format";
import toast from "react-hot-toast";
import type { ReportFilters } from "../../types";

const REPORT_TYPES = [
  { value: "inventory", label: "Inventory Report" },
  { value: "sales", label: "Sales Report" },
  { value: "top-selling", label: "Top Selling Products" },
  { value: "supplier-sales", label: "Supplier Sales Report" },
];

export default function ReportsPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const reportType = REPORT_TYPES[activeTab].value;

  const setFilter = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  // Dropdown data
  const { data: categories } = useQuery({ queryKey: ["categories", "all"], queryFn: () => categoryService.getAll({ pageSize: 200 }) });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers", "all"], queryFn: () => supplierService.getAll({ pageSize: 200 }) });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses", "all"], queryFn: () => warehouseService.getAll({ pageSize: 200 }) });
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: () => productService.getAll({ pageSize: 500 }) });

  // Report data queries
  const { data: inventoryData, isLoading: invLoading } = useQuery({
    queryKey: ["report", "inventory", filters],
    queryFn: () => reportService.getInventory(filters),
    enabled: reportType === "inventory",
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["report", "sales", filters],
    queryFn: () => reportService.getSales(filters),
    enabled: reportType === "sales",
  });

  const { data: topSellingData, isLoading: topLoading } = useQuery({
    queryKey: ["report", "top-selling", filters],
    queryFn: () => reportService.getTopSelling(filters),
    enabled: reportType === "top-selling",
  });

  const { data: supplierSalesData, isLoading: supplierLoading } = useQuery({
    queryKey: ["report", "supplier-sales", filters],
    queryFn: () => reportService.getSupplierSales(filters),
    enabled: reportType === "supplier-sales",
  });

  const isLoading = invLoading || salesLoading || topLoading || supplierLoading;

  const handleExport = async (format: "pdf" | "excel") => {
    setExporting(format);
    try {
      const blob = format === "pdf"
        ? await reportService.exportPdf(reportType, filters)
        : await reportService.exportExcel(reportType, filters);
      const ext = format === "pdf" ? "pdf" : "xlsx";
      downloadBlob(blob, `${reportType}-report-${new Date().toISOString().slice(0, 10)}.${ext}`);
      toast.success(`${format.toUpperCase()} exported successfully`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(null);
    }
  };

  const filterFields = [
    { key: "warehouseId" as keyof ReportFilters, label: "Warehouse", options: warehouses?.data ?? [] },
    { key: "supplierId" as keyof ReportFilters, label: "Supplier", options: suppliers?.data ?? [] },
    { key: "categoryId" as keyof ReportFilters, label: "Category", options: categories?.data ?? [] },
    { key: "productId" as keyof ReportFilters, label: "Product", options: products?.data ?? [] },
  ];

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate business intelligence reports with filters"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }]}
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={exporting === "pdf" ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={exporting === "excel" ? <CircularProgress size={16} /> : <TableViewIcon />}
              onClick={() => handleExport("excel")}
              disabled={!!exporting}
            >
              Excel
            </Button>
          </Box>
        }
      />

      {/* Report type tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          {REPORT_TYPES.map((r) => <Tab key={r.value} label={r.label} />)}
        </Tabs>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FilterListIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight={600}>Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            {filterFields.map(({ key, label, options }) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                <TextField
                  label={label}
                  select
                  size="small"
                  fullWidth
                  value={filters[key] ?? ""}
                  onChange={(e) => setFilter(key, e.target.value)}
                >
                  <MenuItem value="">All {label}s</MenuItem>
                  {options.map((o: { id: string; name: string }) => (
                    <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Date From"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom ?? ""}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Date To"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo ?? ""}
                onChange={(e) => setFilter("dateTo", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report content */}
      {reportType === "inventory" && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Inventory Report</Typography>
            {invLoading ? <Skeleton height={300} /> : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Chip label={`${inventoryData?.length ?? 0} items`} size="small" color="primary" />
                  {inventoryData && (
                    <Chip
                      label={`Total Value: ${formatCurrency(inventoryData.reduce((s, i) => s + i.totalValue, 0))}`}
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Warehouse</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(inventoryData ?? []).map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell><Typography variant="body2" fontWeight={500}>{item.productName}</Typography></TableCell>
                        <TableCell><Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.sku}</Box></TableCell>
                        <TableCell><Chip label={item.categoryName} size="small" variant="outlined" /></TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(item.totalValue)}</Typography></TableCell>
                      </TableRow>
                    ))}
                    {!inventoryData?.length && (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.disabled" }}>No data found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {reportType === "sales" && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Sales Report</Typography>
            {salesLoading ? <Skeleton height={300} /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(salesData ?? []).map((item, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell><Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.referenceNumber}</Box></TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.warehouseName}</TableCell>
                      <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right"><Typography fontWeight={600} color="success.main">{formatCurrency(item.totalAmount)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  {!salesData?.length && (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.disabled" }}>No data found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {reportType === "top-selling" && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Top Selling Products</Typography>
            {topLoading ? <Skeleton height={400} /> : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topSellingData ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="productName" angle={-40} textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    formatter={(value: number, name: string) => [
                      name === "totalRevenue" ? formatCurrency(value) : formatNumber(value),
                      name === "totalRevenue" ? "Revenue" : "Units Sold",
                    ]}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Legend />
                  <Bar dataKey="totalQuantity" fill={theme.palette.primary.main} name="Units Sold" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalRevenue" fill={theme.palette.secondary.main} name="Revenue ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {reportType === "supplier-sales" && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Supplier Sales Report</Typography>
            {supplierLoading ? <Skeleton height={300} /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Total Purchases</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell>Last Purchase Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(supplierSalesData ?? []).map((item, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.supplierName}</Typography></TableCell>
                      <TableCell align="right">{formatNumber(item.totalPurchases)}</TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(item.totalAmount)}</Typography></TableCell>
                      <TableCell>{formatDate(item.lastPurchaseDate)}</TableCell>
                    </TableRow>
                  ))}
                  {!supplierSalesData?.length && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.disabled" }}>No data found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
