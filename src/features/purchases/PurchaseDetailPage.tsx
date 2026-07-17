import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Grid, Typography, Chip, Skeleton, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { purchaseService } from "../../services/purchaseService";
import { PageHeader } from "../../components/PageHeader";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";

const statusColor = (s: string): "default" | "success" | "warning" | "error" => {
  const m: Record<string, "default" | "success" | "warning" | "error"> = { received: "success", pending: "warning", cancelled: "error" };
  return m[s] ?? "default";
};

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchases", id],
    queryFn: () => purchaseService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return (
    <Box>
      <Skeleton height={60} width={300} sx={{ mb: 3 }} />
      <Grid container spacing={2}>{Array.from({ length: 4 }).map((_, i) => <Grid size={{ xs: 12, sm: 6 }} key={i}><Skeleton height={100} /></Grid>)}</Grid>
    </Box>
  );

  if (!purchase) return <Typography>Purchase not found</Typography>;

  return (
    <Box>
      <PageHeader
        title={`Purchase ${purchase.referenceNumber}`}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Purchases", href: "/purchases" }, { label: purchase.referenceNumber }]}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate("/purchases")}>Back</Button>
            <Chip label={purchase.status} color={statusColor(purchase.status)} sx={{ textTransform: "capitalize" }} />
          </>
        }
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Supplier</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{purchase.supplier?.name ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Warehouse</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{purchase.warehouse?.name ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Purchase Date</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{formatDate(purchase.purchaseDate)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Amount</Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>{formatCurrency(purchase.totalAmount)}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Purchase Items</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Batch #</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.items.map((item, i) => (
                    <TableRow key={item.id ?? i} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.product?.name ?? "—"}</Typography></TableCell>
                      <TableCell><Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.product?.sku ?? "—"}</Box></TableCell>
                      <TableCell>{item.batchNumber ?? <Box component="span" color="text.disabled">—</Box>}</TableCell>
                      <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(item.totalCost)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right"><Typography fontWeight={700}>Total</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={700} color="primary.main">{formatCurrency(purchase.totalAmount)}</Typography></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {purchase.notes && (
          <Grid size={{ xs: 12 }}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
              <Typography variant="body2">{purchase.notes}</Typography>
            </CardContent></Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
