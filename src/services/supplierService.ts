import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Supplier, SupplierCreate, PaginatedResponse, PaginationParams } from "../types";

export const supplierService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await apiClient.get<PaginatedResponse<Supplier>>(ENDPOINTS.SUPPLIERS.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.get<Supplier>(ENDPOINTS.SUPPLIERS.BY_ID(id));
    return data;
  },

  create: async (payload: SupplierCreate): Promise<Supplier> => {
    const { data } = await apiClient.post<Supplier>(ENDPOINTS.SUPPLIERS.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<SupplierCreate>): Promise<Supplier> => {
    const { data } = await apiClient.put<Supplier>(ENDPOINTS.SUPPLIERS.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.SUPPLIERS.BY_ID(id));
  },
};
