import React, { useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress, Divider,
} from "@mui/material";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productService } from "../../services/productService";
import { getErrorMessage } from "../../api/client";
import type { Product, Category } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(50),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
  reorderLevel: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, "Category is required"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

export const ProductFormDialog: React.FC<Props> = ({ open, product, categories, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { name: "", sku: "", description: "", unitPrice: 0, reorderLevel: 0, categoryId: "" },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          description: product.description ?? "",
          unitPrice: product.unitPrice,
          reorderLevel: product.reorderLevel,
          categoryId: product.categoryId,
        });
      } else {
        reset({ name: "", sku: "", description: "", unitPrice: 0, reorderLevel: 0, categoryId: "" });
      }
    }
  }, [open, product, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? productService.update(product!.id, data) : productService.create(data),
    onSuccess: () => {
      toast.success(`Product ${isEdit ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Product Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="sku" control={control} render={({ field }) => (
              <TextField {...field} label="SKU" fullWidth error={!!errors.sku} helperText={errors.sku?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={2} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="unitPrice" control={control} render={({ field }) => (
              <TextField {...field} label="Unit Price ($)" type="number" fullWidth error={!!errors.unitPrice} helperText={errors.unitPrice?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="reorderLevel" control={control} render={({ field }) => (
              <TextField {...field} label="Reorder Level" type="number" fullWidth error={!!errors.reorderLevel} helperText={errors.reorderLevel?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <TextField {...field} label="Category" select fullWidth error={!!errors.categoryId} helperText={errors.categoryId?.message}>
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending || isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          disabled={mutation.isPending || isSubmitting}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
