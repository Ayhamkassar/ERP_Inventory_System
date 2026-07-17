import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, TextField, InputAdornment, IconButton, Tooltip, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { warehouseService } from "../../services/warehouseService";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { WarehouseFormDialog } from "./WarehouseFormDialog";
import { getErrorMessage } from "../../api/client";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, formatNumber } from "../../utils/format";
import type { Warehouse } from "../../types";

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Warehouse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["warehouses", paginationModel, debouncedSearch],
    queryFn: () => warehouseService.getAll({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: warehouseService.delete,
    onSuccess: () => { toast.success("Warehouse deleted"); queryClient.invalidateQueries({ queryKey: ["warehouses"] }); setDeleteId(null); },
    onError: (err) => { toast.error(getErrorMessage(err)); setDeleteId(null); },
  });

  const handleEdit = useCallback((item: Warehouse) => { setEditItem(item); setFormOpen(true); }, []);
  const handleClose = useCallback(() => { setFormOpen(false); setEditItem(null); }, []);

  const columns: GridColDef<Warehouse>[] = [
    { field: "name", headerName: "Warehouse Name", flex: 1.5, minWidth: 180 },
    { field: "location", headerName: "Location", flex: 1.5, minWidth: 160,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "capacity", headerName: "Capacity", width: 140, align: "right", headerAlign: "right",
      renderCell: ({ value }) => value ? formatNumber(value as number) : <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
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
        title="Warehouses"
        subtitle="Manage storage locations"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Warehouses" }]}
        badge={data ? String(data.total) : undefined}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>Add Warehouse</Button>}
      />
      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search warehouses..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid rows={data?.data ?? []} columns={columns} rowCount={data?.total ?? 0} loading={isLoading}
          paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight sx={{ border: "none" }}
        />
      </Box>
      <WarehouseFormDialog open={formOpen} warehouse={editItem} onClose={handleClose} />
      <ConfirmDialog open={!!deleteId} title="Delete Warehouse" message="Delete this warehouse permanently?"
        loading={deleteMutation.isPending} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
