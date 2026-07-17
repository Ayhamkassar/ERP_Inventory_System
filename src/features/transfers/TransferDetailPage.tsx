import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Grid, Typography, Chip, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Button,
  LinearProgress, MenuItem, TextField, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import toast from "react-hot-toast";
import { transferService } from "../../services/transferService";
import { PageHeader } from "../../components/PageHeader";
import { getErrorMessage } from "../../api/client";
import { formatDate, formatNumber } from "../../utils/format";
import type { TransferStatus } from "../../types";

const statusConfig: Record<TransferStatus, { color: "default" | "info" | "success" | "warning" | "error"; label: string; progress: number }> = {
  pending: { color: "warning", label: "Pending", progress: 0 },
  in_progress: { color: "info", label: "In Progress", progress: 50 },
  completed: { color: "success", label: "Completed", progress: 100 },
  cancelled: { color: "error", label: "Cancelled", progress: 0 },
};

const statusOrder: TransferStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: transfer, isLoading } = useQuery({
    queryKey: ["transfers", id],
    queryFn: () => transferService.getById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => transferService.updateStatus(id!, status),
    onSuccess: () => {
      toast.success("Transfer status updated");
      queryClient.invalidateQueries({ queryKey: ["transfers", id] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <Box><Skeleton height={60} width={300} sx={{ mb: 3 }} /></Box>;
  if (!transfer) return <Typography>Transfer not found</Typography>;

  const cfg = statusConfig[transfer.status] ?? statusConfig.pending;

  return (
    <Box>
      <PageHeader
        title={`Transfer ${transfer.referenceNumber}`}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Transfers", href: "/transfers" }, { label: transfer.referenceNumber }]}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate("/transfers")}>Back</Button>
            <Chip label={cfg.label} size="small" color={cfg.color} />
          </>
        }
      />

      {/* Transfer progress */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Transfer Progress</Typography>
            <Typography variant="body2" color="text.secondary">{cfg.progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={cfg.progress}
            color={cfg.color === "error" ? "error" : cfg.color === "success" ? "success" : "primary"}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            {statusOrder.filter((s) => s !== "cancelled").map((s) => (
              <Typography key={s} variant="caption" color={transfer.status === s ? "primary.main" : "text.disabled"} fontWeight={transfer.status === s ? 600 : 400}>
                {statusConfig[s].label}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>From</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{transfer.sourceWarehouse?.name ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SwapHorizIcon color="action" sx={{ fontSize: 32 }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>To</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{transfer.destinationWarehouse?.name ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Transfer Date</Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{formatDate(transfer.transferDate)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card><CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Update Status</Typography>
            <TextField
              select size="small" fullWidth sx={{ mt: 1 }}
              value={transfer.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isPending || transfer.status === "cancelled"}
            >
              {statusOrder.map((s) => (
                <MenuItem key={s} value={s}>{statusConfig[s].label}</MenuItem>
              ))}
            </TextField>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Transfer Items</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfer.items.map((item, i) => (
                    <TableRow key={item.id ?? i} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.product?.name ?? "—"}</Typography></TableCell>
                      <TableCell><Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.product?.sku ?? "—"}</Box></TableCell>
                      <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
