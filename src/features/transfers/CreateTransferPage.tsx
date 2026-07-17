import React from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Button, TextField, MenuItem, Grid,
  Typography, IconButton, Table, TableBody, TableCell, TableHead,
  TableRow, Tooltip, Alert, CircularProgress, Divider,
} from "@mui/material";
import { useForm, Controller, useFieldArray, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import toast from "react-hot-toast";
import { transferService } from "../../services/transferService";
import { warehouseService } from "../../services/warehouseService";
import { productService } from "../../services/productService";
import { PageHeader } from "../../components/PageHeader";
import { getErrorMessage } from "../../api/client";

const itemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
});

const schema = z.object({
  sourceWarehouseId: z.string().min(1, "Source warehouse required"),
  destinationWarehouseId: z.string().min(1, "Destination warehouse required"),
  transferDate: z.string().min(1, "Date required"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
}).refine((d) => d.sourceWarehouseId !== d.destinationWarehouseId, {
  message: "Source and destination cannot be the same warehouse",
  path: ["destinationWarehouseId"],
});
type FormData = z.infer<typeof schema>;

export default function CreateTransferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: warehouses } = useQuery({ queryKey: ["warehouses", "all"], queryFn: () => warehouseService.getAll({ pageSize: 200 }) });
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: () => productService.getAll({ pageSize: 500 }) });

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      sourceWarehouseId: "", destinationWarehouseId: "",
      transferDate: new Date().toISOString().slice(0, 10),
      notes: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const mutation = useMutation({
    mutationFn: (data: FormData) => transferService.create({
      ...data,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    }),
    onSuccess: (result: { id: string }) => {
      toast.success("Transfer created successfully");
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      navigate(`/transfers/${result.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Box>
      <PageHeader
        title="New Transfer"
        subtitle="Transfer inventory between warehouses"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Transfers", href: "/transfers" }, { label: "New" }]}
        actions={<Button variant="outlined" onClick={() => navigate("/transfers")}>Cancel</Button>}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Transfer Details</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Controller name="sourceWarehouseId" control={control} render={({ field }) => (
                      <TextField {...field} label="Source Warehouse" select fullWidth error={!!errors.sourceWarehouseId} helperText={errors.sourceWarehouseId?.message}>
                        <MenuItem value="">Select Source</MenuItem>
                        {warehouses?.data.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }} sx={{ display: "flex", justifyContent: "center" }}>
                    <SwapHorizIcon color="action" sx={{ fontSize: 36 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Controller name="destinationWarehouseId" control={control} render={({ field }) => (
                      <TextField {...field} label="Destination Warehouse" select fullWidth error={!!errors.destinationWarehouseId} helperText={errors.destinationWarehouseId?.message}>
                        <MenuItem value="">Select Destination</MenuItem>
                        {warehouses?.data.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller name="transferDate" control={control} render={({ field }) => (
                      <TextField {...field} label="Transfer Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller name="notes" control={control} render={({ field }) => (
                      <TextField {...field} label="Notes (optional)" fullWidth multiline rows={2} />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Items to Transfer</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => append({ productId: "", quantity: 1 })}>Add Item</Button>
                </Box>
                {errors.items && !Array.isArray(errors.items) && (
                  <Alert severity="error" sx={{ mb: 2 }}>{errors.items.message}</Alert>
                )}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell width={140} align="right">Quantity</TableCell>
                      <TableCell width={56} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Controller name={`items.${index}.productId`} control={control} render={({ field: f }) => (
                            <TextField {...f} select size="small" fullWidth sx={{ minWidth: 220 }}>
                              <MenuItem value="">Select Product</MenuItem>
                              {products?.data.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>)}
                            </TextField>
                          )} />
                        </TableCell>
                        <TableCell align="right">
                          <Controller name={`items.${index}.quantity`} control={control} render={({ field: f }) => (
                            <TextField {...f} type="number" size="small" sx={{ width: 120 }} inputProps={{ min: 1 }} />
                          )} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Remove">
                            <IconButton size="small" color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/transfers")}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending}
                startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                onClick={handleSubmit((d) => mutation.mutate(d as FormData))}>
                Create Transfer
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
