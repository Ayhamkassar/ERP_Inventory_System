import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, TextField, InputAdornment, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router";
import { transferService } from "../../services/transferService";
import { PageHeader } from "../../components/PageHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import type { Transfer, TransferStatus } from "../../types";

const statusConfig: Record<TransferStatus, { color: "default" | "info" | "success" | "warning" | "error"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  in_progress: { color: "info", label: "In Progress" },
  completed: { color: "success", label: "Completed" },
  cancelled: { color: "error", label: "Cancelled" },
};

export default function TransfersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["transfers", paginationModel, debouncedSearch],
    queryFn: () => transferService.getAll({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  const columns: GridColDef<Transfer>[] = [
    { field: "referenceNumber", headerName: "Reference", width: 160,
      renderCell: ({ value }) => <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{value}</Box>,
    },
    { field: "sourceWarehouse", headerName: "From", flex: 1, minWidth: 140,
      valueGetter: (_: unknown, row: Transfer) => row.sourceWarehouse?.name ?? "—",
    },
    { field: "destinationWarehouse", headerName: "To", flex: 1, minWidth: 140,
      valueGetter: (_: unknown, row: Transfer) => row.destinationWarehouse?.name ?? "—",
    },
    { field: "items", headerName: "Items", width: 100, align: "center", headerAlign: "center",
      valueGetter: (_: unknown, row: Transfer) => row.items?.length ?? 0,
    },
    { field: "status", headerName: "Status", width: 140,
      renderCell: ({ value }) => {
        const cfg = statusConfig[value as TransferStatus] ?? { color: "default", label: value };
        return <Chip label={cfg.label} size="small" color={cfg.color} />;
      },
    },
    { field: "transferDate", headerName: "Transfer Date", width: 140, renderCell: ({ value }) => formatDate(value as string) },
  ];

  return (
    <Box>
      <PageHeader
        title="Transfers"
        subtitle="Move inventory between warehouses"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Transfers" }]}
        badge={data ? String(data.total) : undefined}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/transfers/new")}>New Transfer</Button>
        }
      />
      <Box sx={{ mb: 2 }}>
        <TextField placeholder="Search transfers..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <DataGrid
          rows={data?.data ?? []} columns={columns} rowCount={data?.total ?? 0} loading={isLoading}
          paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight
          onRowClick={({ row }) => navigate(`/transfers/${row.id}`)}
          sx={{ border: "none", "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Box>
    </Box>
  );
}
