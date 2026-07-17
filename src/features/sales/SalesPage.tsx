import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, TextField, InputAdornment, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router";
import { saleService } from "../../services/saleService";
import { PageHeader } from "../../components/PageHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/format";
import type { Sale } from "../../types";

const statusColor = (s: string): "default" | "success" | "warning" | "error" =>
  ({ completed: "success", pending: "warning", cancelled: "error" } as Record<string, "default" | "success" | "warning" | "error">)[s] ?? "default";

export default function SalesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["sales", paginationModel, debouncedSearch],
    queryFn: () => saleService.getAll({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  const columns: GridColDef<Sale>[] = [
    { field: "referenceNumber", headerName: "Reference", width: 160,
      renderCell: ({ value }) => <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{value}</Box>,
    },
    { field: "customerName", headerName: "Customer", flex: 1, minWidth: 150,
      renderCell: ({ value }) => value || <Box component="span" color="text.disabled">Walk-in</Box>,
    },
    { field: "warehouse", headerName: "Warehouse", flex: 1, minWidth: 140,
      valueGetter: (_: unknown, row: Sale) => row.warehouse?.name ?? "—",
    },
    { field: "totalAmount", headerName: "Total Amount", width: 150, align: "right", headerAlign: "right",
      renderCell: ({ value }) => <Box fontWeight={600} color="success.main">{formatCurrency(value as number)}</Box>,
    },
    { field: "status", headerName: "Status", width: 130,
      renderCell: ({ value }) => <Chip label={value} size="small" color={statusColor(value as string)} sx={{ textTransform: "capitalize" }} />,
    },
    { field: "saleDate", headerName: "Sale Date", width: 140, renderCell: ({ value }) => formatDate(value as string) },
  ];

  return (
    <Box>
      <PageHeader
        title="Sales"
        subtitle="Track outgoing sales transactions"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Sales" }]}
        badge={data ? String(data.total) : undefined}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/sales/new")}>New Sale</Button>
        }
      />
      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid
          rows={data?.data ?? []} columns={columns} rowCount={data?.total ?? 0} loading={isLoading}
          paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight
          onRowClick={({ row }) => navigate(`/sales/${row.id}`)}
          sx={{ border: "none", "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Box>
    </Box>
  );
}
