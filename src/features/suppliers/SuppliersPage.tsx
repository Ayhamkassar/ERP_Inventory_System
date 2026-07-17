import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, InputAdornment, IconButton, Tooltip, Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { supplierService } from "../../services/supplierService";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { getErrorMessage } from "../../api/client";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import type { Supplier } from "../../types";

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", paginationModel, debouncedSearch],
    queryFn: () => supplierService.getAll({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => { toast.success("Supplier deleted"); queryClient.invalidateQueries({ queryKey: ["suppliers"] }); setDeleteId(null); },
    onError: (err) => { toast.error(getErrorMessage(err)); setDeleteId(null); },
  });

  const handleEdit = useCallback((item: Supplier) => { setEditItem(item); setFormOpen(true); }, []);
  const handleClose = useCallback(() => { setFormOpen(false); setEditItem(null); }, []);

  const columns: GridColDef<Supplier>[] = [
    { field: "name", headerName: "Supplier Name", flex: 1.5, minWidth: 180 },
    { field: "contactPerson", headerName: "Contact Person", flex: 1, minWidth: 150,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 160,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "phone", headerName: "Phone", width: 140,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "address", headerName: "Address", flex: 1.5, minWidth: 160,
      renderCell: ({ value }) => value ? <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span> : <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "createdAt", headerName: "Created", width: 130, renderCell: ({ value }) => formatDate(value as string) },
    {
      field: "actions", headerName: "Actions", width: 100, sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier relationships"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Suppliers" }]}
        badge={data ? String(data.total) : undefined}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>Add Supplier</Button>}
      />
      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid rows={data?.data ?? []} columns={columns} rowCount={data?.total ?? 0} loading={isLoading}
          paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight sx={{ border: "none" }}
        />
      </Box>
      <SupplierFormDialog open={formOpen} supplier={editItem} onClose={handleClose} />
      <ConfirmDialog open={!!deleteId} title="Delete Supplier" message="Delete this supplier permanently?"
        loading={deleteMutation.isPending} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
