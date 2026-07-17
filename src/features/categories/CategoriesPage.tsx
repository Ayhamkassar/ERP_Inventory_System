import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, InputAdornment, IconButton, Tooltip, Stack, Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { categoryService } from "../../services/categoryService";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { getErrorMessage } from "../../api/client";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import type { Category } from "../../types";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", paginationModel, debouncedSearch],
    queryFn: () => categoryService.getAll({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: debouncedSearch || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
    },
    onError: (err) => { toast.error(getErrorMessage(err)); setDeleteId(null); },
  });

  const handleEdit = useCallback((item: Category) => { setEditItem(item); setFormOpen(true); }, []);
  const handleClose = useCallback(() => { setFormOpen(false); setEditItem(null); }, []);

  const columns: GridColDef<Category>[] = [
    { field: "name", headerName: "Category Name", flex: 1, minWidth: 200 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "productCount", headerName: "Products", width: 120, align: "center", headerAlign: "center",
      renderCell: ({ value }) => <Chip label={value ?? 0} size="small" variant="outlined" />,
    },
    { field: "createdAt", headerName: "Created", width: 140, renderCell: ({ value }) => formatDate(value as string) },
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
        title="Categories"
        subtitle="Organize products into categories"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Categories" }]}
        badge={data ? String(data.total) : undefined}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>Add Category</Button>}
      />
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid
          rows={data?.data ?? []}
          columns={columns}
          rowCount={data?.total ?? 0}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: "none" }}
        />
      </Box>
      <CategoryFormDialog open={formOpen} category={editItem} onClose={handleClose} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category will be unassigned."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
