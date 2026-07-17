import React, { useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, CircularProgress, Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoryService } from "../../services/categoryService";
import { getErrorMessage } from "../../api/client";
import type { Category } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; category: Category | null; onClose: () => void }

export const CategoryFormDialog: React.FC<Props> = ({ open, category, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) reset(category ? { name: category.name, description: category.description ?? "" } : { name: "", description: "" });
  }, [open, category, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => isEdit ? categoryService.update(category!.id, data) : categoryService.create(data),
    onSuccess: () => {
      toast.success(`Category ${isEdit ? "updated" : "created"}`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Category Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={3} />
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit((d) => mutation.mutate(d))}
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
