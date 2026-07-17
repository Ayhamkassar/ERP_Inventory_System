import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  DashboardStats,
  TopSellingProduct,
  SalesPurchaseData,
  LowStockProduct,
  RecentTransaction,
} from "../types";

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
    return data;
  },

  getTopSelling: async (limit = 10): Promise<TopSellingProduct[]> => {
    const { data } = await apiClient.get<TopSellingProduct[]>(ENDPOINTS.DASHBOARD.TOP_SELLING, { params: { limit } });
    return data;
  },

  getSalesPurchases: async (days = 30): Promise<SalesPurchaseData[]> => {
    const { data } = await apiClient.get<SalesPurchaseData[]>(ENDPOINTS.DASHBOARD.SALES_PURCHASES, { params: { days } });
    return data;
  },

  getLowStock: async (): Promise<LowStockProduct[]> => {
    const { data } = await apiClient.get<LowStockProduct[]>(ENDPOINTS.DASHBOARD.LOW_STOCK);
    return data;
  },

  getRecentTransactions: async (limit = 10): Promise<RecentTransaction[]> => {
    const { data } = await apiClient.get<RecentTransaction[]>(ENDPOINTS.DASHBOARD.RECENT_TRANSACTIONS, { params: { limit } });
    return data;
  },
};
