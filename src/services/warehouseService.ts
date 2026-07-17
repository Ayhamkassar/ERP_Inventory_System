import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Warehouse, WarehouseCreate, PaginatedResponse, PaginationParams } from "../types";

export const warehouseService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Warehouse>> => {
    const { data } = await apiClient.get<PaginatedResponse<Warehouse>>(ENDPOINTS.WAREHOUSES.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const { data } = await apiClient.get<Warehouse>(ENDPOINTS.WAREHOUSES.BY_ID(id));
    return data;
  },

  create: async (payload: WarehouseCreate): Promise<Warehouse> => {
    const { data } = await apiClient.post<Warehouse>(ENDPOINTS.WAREHOUSES.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<WarehouseCreate>): Promise<Warehouse> => {
    const { data } = await apiClient.put<Warehouse>(ENDPOINTS.WAREHOUSES.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.WAREHOUSES.BY_ID(id));
  },
};
