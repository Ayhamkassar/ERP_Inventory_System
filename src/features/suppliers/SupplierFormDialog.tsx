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
import { supplierService } from "../../services/supplierService";
import { getErrorMessage } from "../../api/client";
import type { Supplier } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; supplier: Supplier | null; onClose: () => void }

export const SupplierFormDialog: React.FC<Props> = ({ open, supplier, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = !!supplier;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contactPerson: "", email: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (open) reset(supplier
      ? { name: supplier.name, contactPerson: supplier.contactPerson ?? "", email: supplier.email ?? "", phone: supplier.phone ?? "", address: supplier.address ?? "" }
      : { name: "", contactPerson: "", email: "", phone: "", address: "" }
    );
  }, [open, supplier, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => isEdit ? supplierService.update(supplier!.id, data) : supplierService.create(data),
    onSuccess: () => { toast.success(`Supplier ${isEdit ? "updated" : "created"}`); queryClient.invalidateQueries({ queryKey: ["suppliers"] }); onClose(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Supplier Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="contactPerson" control={control} render={({ field }) => (
              <TextField {...field} label="Contact Person" fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="phone" control={control} render={({ field }) => (
              <TextField {...field} label="Phone" fullWidth />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="address" control={control} render={({ field }) => (
              <TextField {...field} label="Address" fullWidth multiline rows={2} />
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
