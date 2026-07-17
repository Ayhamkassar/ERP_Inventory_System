import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Button, TextField, MenuItem, Grid,
  Typography, IconButton, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, Tooltip, Alert, CircularProgress,
} from "@mui/material";
import { useForm, Controller, useFieldArray, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { purchaseService } from "../../services/purchaseService";
import { supplierService } from "../../services/supplierService";
import { warehouseService } from "../../services/warehouseService";
import { productService } from "../../services/productService";
import { PageHeader } from "../../components/PageHeader";
import { getErrorMessage } from "../../api/client";
import { formatCurrency } from "../../utils/format";

const itemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  unitCost: z.coerce.number().min(0, "Min 0"),
  batchNumber: z.string().optional(),
});

const schema = z.object({
  supplierId: z.string().min(1, "Supplier required"),
  warehouseId: z.string().min(1, "Warehouse required"),
  purchaseDate: z.string().min(1, "Date required"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormData = z.infer<typeof schema>;

export default function CreatePurchasePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({ queryKey: ["suppliers", "all"], queryFn: () => supplierService.getAll({ pageSize: 200 }) });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses", "all"], queryFn: () => warehouseService.getAll({ pageSize: 200 }) });
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: () => productService.getAll({ pageSize: 500 }) });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      supplierId: "", warehouseId: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: "",
      items: [{ productId: "", quantity: 1, unitCost: 0, batchNumber: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const totalAmount = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const mutation = useMutation({
    mutationFn: (data: FormData) => purchaseService.create({
      ...data,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        totalCost: Number(item.quantity) * Number(item.unitCost),
        batchNumber: item.batchNumber,
      })),
    }),
    onSuccess: (result: { id: string }) => {
      toast.success("Purchase created successfully");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      navigate(`/purchases/${result.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Box>
      <PageHeader
        title="New Purchase"
        subtitle="Create a new purchase order"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Purchases", href: "/purchases" }, { label: "New" }]}
        actions={
          <Button variant="outlined" onClick={() => navigate("/purchases")}>Cancel</Button>
        }
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Grid container spacing={2.5}>
          {/* Header info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Purchase Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="supplierId" control={control} render={({ field }) => (
                      <TextField {...field} label="Supplier" select fullWidth error={!!errors.supplierId} helperText={errors.supplierId?.message}>
                        <MenuItem value="">Select Supplier</MenuItem>
                        {suppliers?.data.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="warehouseId" control={control} render={({ field }) => (
                      <TextField {...field} label="Destination Warehouse" select fullWidth error={!!errors.warehouseId} helperText={errors.warehouseId?.message}>
                        <MenuItem value="">Select Warehouse</MenuItem>
                        {warehouses?.data.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="purchaseDate" control={control} render={({ field }) => (
                      <TextField {...field} label="Purchase Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.purchaseDate} helperText={errors.purchaseDate?.message} />
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

          {/* Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Order Summary</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Items</Typography>
                  <Typography variant="body2" fontWeight={600}>{fields.length}</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main">{formatCurrency(totalAmount)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Items table */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Purchase Items</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => append({ productId: "", quantity: 1, unitCost: 0, batchNumber: "" })}
                  >
                    Add Item
                  </Button>
                </Box>
                {errors.items && !Array.isArray(errors.items) && (
                  <Alert severity="error" sx={{ mb: 2 }}>{errors.items.message}</Alert>
                )}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell width={100} align="right">Quantity</TableCell>
                      <TableCell width={130} align="right">Unit Cost</TableCell>
                      <TableCell width={130}>Batch #</TableCell>
                      <TableCell width={130} align="right">Total</TableCell>
                      <TableCell width={56} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => {
                      const qty = Number(watchedItems[index]?.quantity) || 0;
                      const cost = Number(watchedItems[index]?.unitCost) || 0;
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller name={`items.${index}.productId`} control={control} render={({ field: f }) => (
                              <TextField {...f} select size="small" fullWidth error={!!errors.items?.[index]?.productId} sx={{ minWidth: 200 }}>
                                <MenuItem value="">Select Product</MenuItem>
                                {products?.data.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>)}
                              </TextField>
                            )} />
                          </TableCell>
                          <TableCell align="right">
                            <Controller name={`items.${index}.quantity`} control={control} render={({ field: f }) => (
                              <TextField {...f} type="number" size="small" sx={{ width: 90 }} error={!!errors.items?.[index]?.quantity} inputProps={{ min: 1 }} />
                            )} />
                          </TableCell>
                          <TableCell align="right">
                            <Controller name={`items.${index}.unitCost`} control={control} render={({ field: f }) => (
                              <TextField {...f} type="number" size="small" sx={{ width: 110 }} error={!!errors.items?.[index]?.unitCost} inputProps={{ min: 0, step: 0.01 }} />
                            )} />
                          </TableCell>
                          <TableCell>
                            <Controller name={`items.${index}.batchNumber`} control={control} render={({ field: f }) => (
                              <TextField {...f} size="small" sx={{ width: 120 }} placeholder="Optional" />
                            )} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(qty * cost)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Remove">
                              <IconButton size="small" color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="subtitle2" fontWeight={700}>Total Amount</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main">{formatCurrency(totalAmount)}</Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/purchases")}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
                startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                onClick={handleSubmit((d) => mutation.mutate(d as FormData))}
              >
                Create Purchase
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
