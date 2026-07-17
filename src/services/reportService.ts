import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  InventoryReportItem,
  SalesReportItem,
  TopSellingProduct,
  SupplierSalesReportItem,
  ReportFilters,
} from "../types";

export const reportService = {
  getInventory: async (filters?: ReportFilters): Promise<InventoryReportItem[]> => {
    const { data } = await apiClient.get<InventoryReportItem[]>(ENDPOINTS.REPORTS.INVENTORY, { params: filters });
    return data;
  },

  getSales: async (filters?: ReportFilters): Promise<SalesReportItem[]> => {
    const { data } = await apiClient.get<SalesReportItem[]>(ENDPOINTS.REPORTS.SALES, { params: filters });
    return data;
  },

  getTopSelling: async (filters?: ReportFilters): Promise<TopSellingProduct[]> => {
    const { data } = await apiClient.get<TopSellingProduct[]>(ENDPOINTS.REPORTS.TOP_SELLING, { params: filters });
    return data;
  },

  getSupplierSales: async (filters?: ReportFilters): Promise<SupplierSalesReportItem[]> => {
    const { data } = await apiClient.get<SupplierSalesReportItem[]>(ENDPOINTS.REPORTS.SUPPLIER_SALES, { params: filters });
    return data;
  },

  exportPdf: async (reportType: string, filters?: ReportFilters): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(ENDPOINTS.REPORTS.EXPORT_PDF, {
      params: { reportType, ...filters },
      responseType: "blob",
    });
    return data;
  },

  exportExcel: async (reportType: string, filters?: ReportFilters): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(ENDPOINTS.REPORTS.EXPORT_EXCEL, {
      params: { reportType, ...filters },
      responseType: "blob",
    });
    return data;
  },
};
