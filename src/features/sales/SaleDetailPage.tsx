import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Grid, Typography, Chip, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { saleService } from "../../services/saleService";
import { PageHeader } from "../../components/PageHeader";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";

const statusColor = (s: string): "default" | "success" | "warning" | "error" =>
  ({ completed: "success", pending: "warning", cancelled: "error" } as Record<string, "default" | "success" | "warning" | "error">)[s] ?? "default";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sale, isLoading } = useQuery({
    queryKey: ["sales", id],
    queryFn: () => saleService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Box><Skeleton height={60} width={300} sx={{ mb: 3 }} /></Box>;
  if (!sale) return <Typography>Sale not found</Typography>;

  return (
    <Box>
      <PageHeader
        title={`Sale ${sale.referenceNumber}`}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Sales", href: "/sales" }, { label: sale.referenceNumber }]}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate("/sales")}>Back</Button>
            <Chip label={sale.status} color={statusColor(sale.status)} sx={{ textTransform: "capitalize" }} />
          </>
        }
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{sale.customerName || "Walk-in Customer"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Warehouse</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{sale.warehouse?.name ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Sale Date</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{formatDate(sale.saleDate)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Amount</Typography>
            <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>{formatCurrency(sale.totalAmount)}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Sale Items</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item, i) => (
                    <TableRow key={item.id ?? i} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.product?.name ?? "—"}</Typography></TableCell>
                      <TableCell><Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.product?.sku ?? "—"}</Box></TableCell>
                      <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(item.totalPrice)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right"><Typography fontWeight={700}>Total</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={700} color="success.main">{formatCurrency(sale.totalAmount)}</Typography></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
