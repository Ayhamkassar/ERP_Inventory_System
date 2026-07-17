import React from "react";
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
import { saleService } from "../../services/saleService";
import { warehouseService } from "../../services/warehouseService";
import { productService } from "../../services/productService";
import { PageHeader } from "../../components/PageHeader";
import { getErrorMessage } from "../../api/client";
import { formatCurrency } from "../../utils/format";

const itemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  unitPrice: z.coerce.number().min(0, "Min 0"),
});

const schema = z.object({
  warehouseId: z.string().min(1, "Warehouse required"),
  customerName: z.string().optional(),
  saleDate: z.string().min(1, "Date required"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormData = z.infer<typeof schema>;

export default function CreateSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: warehouses } = useQuery({ queryKey: ["warehouses", "all"], queryFn: () => warehouseService.getAll({ pageSize: 200 }) });
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: () => productService.getAll({ pageSize: 500 }) });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      warehouseId: "", customerName: "",
      saleDate: new Date().toISOString().slice(0, 10),
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const totalAmount = watchedItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const mutation = useMutation({
    mutationFn: (data: FormData) => saleService.create({
      ...data,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      })),
    }),
    onSuccess: (result: { id: string }) => {
      toast.success("Sale created successfully");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      navigate(`/sales/${result.id}`);
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("stock") || msg.toLowerCase().includes("insufficient")) {
        toast.error(`Insufficient Stock: ${msg}`, { duration: 6000 });
      } else if (msg.toLowerCase().includes("batch")) {
        toast.error(`Batch Unavailable: ${msg}`, { duration: 6000 });
      } else if (msg.toLowerCase().includes("concurr") || msg.toLowerCase().includes("conflict")) {
        toast.error(`Concurrency Error: ${msg}. Please refresh and try again.`, { duration: 6000 });
      } else {
        toast.error(msg);
      }
    },
  });

  return (
    <Box>
      <PageHeader
        title="New Sale"
        subtitle="Create a new sales transaction"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Sales", href: "/sales" }, { label: "New" }]}
        actions={<Button variant="outlined" onClick={() => navigate("/sales")}>Cancel</Button>}
      />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Sale Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="warehouseId" control={control} render={({ field }) => (
                      <TextField {...field} label="Source Warehouse" select fullWidth error={!!errors.warehouseId} helperText={errors.warehouseId?.message}>
                        <MenuItem value="">Select Warehouse</MenuItem>
                        {warehouses?.data.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="customerName" control={control} render={({ field }) => (
                      <TextField {...field} label="Customer Name (optional)" fullWidth />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="saleDate" control={control} render={({ field }) => (
                      <TextField {...field} label="Sale Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.saleDate} helperText={errors.saleDate?.message} />
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
                  <Typography variant="subtitle1" fontWeight={700} color="success.main">{formatCurrency(totalAmount)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Sale Items</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}>Add Item</Button>
                </Box>
                {errors.items && !Array.isArray(errors.items) && (
                  <Alert severity="error" sx={{ mb: 2 }}>{errors.items.message}</Alert>
                )}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell width={100} align="right">Quantity</TableCell>
                      <TableCell width={130} align="right">Unit Price</TableCell>
                      <TableCell width={130} align="right">Total</TableCell>
                      <TableCell width={56} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => {
                      const qty = Number(watchedItems[index]?.quantity) || 0;
                      const price = Number(watchedItems[index]?.unitPrice) || 0;
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
                              <TextField {...f} type="number" size="small" sx={{ width: 90 }} inputProps={{ min: 1 }} />
                            )} />
                          </TableCell>
                          <TableCell align="right">
                            <Controller name={`items.${index}.unitPrice`} control={control} render={({ field: f }) => (
                              <TextField {...f} type="number" size="small" sx={{ width: 110 }} inputProps={{ min: 0, step: 0.01 }} />
                            )} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.main">{formatCurrency(qty * price)}</Typography>
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
                      <TableCell colSpan={3} align="right"><Typography fontWeight={700}>Total Amount</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={700} color="success.main">{formatCurrency(totalAmount)}</Typography></TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/sales")}>Cancel</Button>
              <Button type="submit" variant="contained" color="success" disabled={mutation.isPending}
                startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                onClick={handleSubmit((d) => mutation.mutate(d as FormData))}>
                Create Sale
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
