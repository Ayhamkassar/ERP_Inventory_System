import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Purchase, PurchaseCreate, PaginatedResponse, PaginationParams } from "../types";

export const purchaseService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Purchase>> => {
    const { data } = await apiClient.get<PaginatedResponse<Purchase>>(ENDPOINTS.PURCHASES.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Purchase> => {
    const { data } = await apiClient.get<Purchase>(ENDPOINTS.PURCHASES.BY_ID(id));
    return data;
  },

  create: async (payload: PurchaseCreate): Promise<Purchase> => {
    const { data } = await apiClient.post<Purchase>(ENDPOINTS.PURCHASES.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<PurchaseCreate>): Promise<Purchase> => {
    const { data } = await apiClient.put<Purchase>(ENDPOINTS.PURCHASES.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PURCHASES.BY_ID(id));
  },
};
