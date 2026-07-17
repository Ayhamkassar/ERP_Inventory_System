import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Sale, SaleCreate, PaginatedResponse, PaginationParams } from "../types";

export const saleService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Sale>> => {
    const { data } = await apiClient.get<PaginatedResponse<Sale>>(ENDPOINTS.SALES.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await apiClient.get<Sale>(ENDPOINTS.SALES.BY_ID(id));
    return data;
  },

  create: async (payload: SaleCreate): Promise<Sale> => {
    const { data } = await apiClient.post<Sale>(ENDPOINTS.SALES.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<SaleCreate>): Promise<Sale> => {
    const { data } = await apiClient.put<Sale>(ENDPOINTS.SALES.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.SALES.BY_ID(id));
  },
};
