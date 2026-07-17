import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Transfer, TransferCreate, PaginatedResponse, PaginationParams } from "../types";

export const transferService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Transfer>> => {
    const { data } = await apiClient.get<PaginatedResponse<Transfer>>(ENDPOINTS.TRANSFERS.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Transfer> => {
    const { data } = await apiClient.get<Transfer>(ENDPOINTS.TRANSFERS.BY_ID(id));
    return data;
  },

  create: async (payload: TransferCreate): Promise<Transfer> => {
    const { data } = await apiClient.post<Transfer>(ENDPOINTS.TRANSFERS.BASE, payload);
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<Transfer> => {
    const { data } = await apiClient.patch<Transfer>(`${ENDPOINTS.TRANSFERS.BY_ID(id)}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TRANSFERS.BY_ID(id));
  },
};
