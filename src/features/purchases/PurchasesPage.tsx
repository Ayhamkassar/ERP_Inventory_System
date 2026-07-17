import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Button, TextField, InputAdornment, Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router";
import { purchaseService } from "../../services/purchaseService";
import { PageHeader } from "../../components/PageHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/format";
import type { Purchase } from "../../types";

const statusColor = (status: string): "default" | "success" | "warning" | "error" => {
  const m: Record<string, "default" | "success" | "warning" | "error"> = {
    received: "success", pending: "warning", cancelled: "error",
  };
  return m[status] ?? "default";
};

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["purchases", paginationModel, debouncedSearch],
    queryFn: () => purchaseService.getAll({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  const columns: GridColDef<Purchase>[] = [
    { field: "referenceNumber", headerName: "Reference", width: 160,
      renderCell: ({ value }) => <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{value}</Box>,
    },
    { field: "supplier", headerName: "Supplier", flex: 1.2, minWidth: 150,
      valueGetter: (_: unknown, row: Purchase) => row.supplier?.name ?? "—",
    },
    { field: "warehouse", headerName: "Warehouse", flex: 1, minWidth: 140,
      valueGetter: (_: unknown, row: Purchase) => row.warehouse?.name ?? "—",
    },
    { field: "totalAmount", headerName: "Total Amount", width: 150, align: "right", headerAlign: "right",
      renderCell: ({ value }) => <Box fontWeight={600}>{formatCurrency(value as number)}</Box>,
    },
    { field: "status", headerName: "Status", width: 130,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color={statusColor(value as string)} sx={{ textTransform: "capitalize" }} />
      ),
    },
    { field: "purchaseDate", headerName: "Purchase Date", width: 140, renderCell: ({ value }) => formatDate(value as string) },
    { field: "createdAt", headerName: "Created", width: 130, renderCell: ({ value }) => formatDate(value as string) },
  ];

  return (
    <Box>
      <PageHeader
        title="Purchases"
        subtitle="Track incoming inventory purchases"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Purchases" }]}
        badge={data ? String(data.total) : undefined}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchases/new")}>
            New Purchase
          </Button>
        }
      />
      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search purchases..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid
          rows={data?.data ?? []} columns={columns} rowCount={data?.total ?? 0} loading={isLoading}
          paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight sx={{ border: "none", "& .MuiDataGrid-row": { cursor: "pointer" } }}
          onRowClick={({ row }) => navigate(`/purchases/${row.id}`)}
        />
      </Box>
    </Box>
  );
}
