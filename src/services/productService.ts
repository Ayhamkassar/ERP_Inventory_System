import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Product, ProductCreate, PaginatedResponse, PaginationParams } from "../types";

export const productService = {
  getAll: async (params?: PaginationParams & { categoryId?: string }): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get<PaginatedResponse<Product>>(ENDPOINTS.PRODUCTS.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(ENDPOINTS.PRODUCTS.BY_ID(id));
    return data;
  },

  create: async (payload: ProductCreate): Promise<Product> => {
    const { data } = await apiClient.post<Product>(ENDPOINTS.PRODUCTS.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<ProductCreate>): Promise<Product> => {
    const { data } = await apiClient.put<Product>(ENDPOINTS.PRODUCTS.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRODUCTS.BY_ID(id));
  },
};
