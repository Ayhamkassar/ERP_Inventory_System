import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, InputAdornment, MenuItem, Select,
  FormControl, InputLabel, Chip, IconButton, Tooltip, Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridSortModel, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ProductFormDialog } from "./ProductFormDialog";
import { getErrorMessage } from "../../api/client";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/format";
import type { Product } from "../../types";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", paginationModel, debouncedSearch, categoryFilter, sortModel],
    queryFn: () => productService.getAll({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: debouncedSearch || undefined,
      categoryId: categoryFilter || undefined,
      sortBy: sortModel[0]?.field,
      sortOrder: sortModel[0]?.sort ?? undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const { data: categories = { data: [], total: 0, page: 1, pageSize: 100, totalPages: 1 } } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoryService.getAll({ pageSize: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setDeleteId(null);
    },
  });

  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditProduct(null);
  }, []);

  const columns: GridColDef<Product>[] = [
    { field: "sku", headerName: "SKU", width: 130, renderCell: ({ value }) => (
      <Box component="span" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{value}</Box>
    )},
    { field: "name", headerName: "Product Name", flex: 1.5, minWidth: 180 },
    { field: "category", headerName: "Category", width: 150,
      valueGetter: (_: unknown, row: Product) => row.category?.name ?? "—",
      renderCell: ({ value }) => value !== "—"
        ? <Chip label={value} size="small" variant="outlined" />
        : <Box component="span" color="text.disabled">—</Box>,
    },
    { field: "unitPrice", headerName: "Unit Price", width: 130, align: "right", headerAlign: "right",
      renderCell: ({ value }) => (
        <Box fontWeight={600}>{formatCurrency(value as number)}</Box>
      ),
    },
    { field: "reorderLevel", headerName: "Reorder Level", width: 140, align: "right", headerAlign: "right" },
    { field: "createdAt", headerName: "Created", width: 130,
      renderCell: ({ value }) => formatDate(value as string),
    },
    {
      field: "actions", headerName: "Actions", width: 100, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Products" }]}
        badge={data ? String(data.total) : undefined}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Add Product
          </Button>
        }
      />

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.data.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid
          rows={data?.data ?? []}
          columns={columns}
          rowCount={data?.total ?? 0}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: "none" }}
          slots={{ noRowsOverlay: () => (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "text.secondary" }}>
              No products found
            </Box>
          )}}
        />
      </Box>

      <ProductFormDialog
        open={formOpen}
        product={editProduct}
        categories={categories.data}
        onClose={handleCloseForm}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
