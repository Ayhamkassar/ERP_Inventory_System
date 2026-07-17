import React, { useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, CircularProgress, Divider } from "@mui/material";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { warehouseService } from "../../services/warehouseService";
import { getErrorMessage } from "../../api/client";
import type { Warehouse } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; warehouse: Warehouse | null; onClose: () => void }

export const WarehouseFormDialog: React.FC<Props> = ({ open, warehouse, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = !!warehouse;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { name: "", location: "", capacity: undefined, description: "" },
  });

  useEffect(() => {
    if (open) reset(warehouse
      ? { name: warehouse.name, location: warehouse.location ?? "", capacity: warehouse.capacity, description: warehouse.description ?? "" }
      : { name: "", location: "", capacity: undefined, description: "" }
    );
  }, [open, warehouse, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => isEdit ? warehouseService.update(warehouse!.id, data) : warehouseService.create(data),
    onSuccess: () => { toast.success(`Warehouse ${isEdit ? "updated" : "created"}`); queryClient.invalidateQueries({ queryKey: ["warehouses"] }); onClose(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Warehouse Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller name="location" control={control} render={({ field }) => (
              <TextField {...field} label="Location / Address" fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="capacity" control={control} render={({ field }) => (
              <TextField {...field} label="Capacity (units)" type="number" fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={2} />
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit((d) => mutation.mutate(d as FormData))} disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
