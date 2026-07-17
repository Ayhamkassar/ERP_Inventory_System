import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Category, CategoryCreate, PaginatedResponse, PaginationParams } from "../types";

export const categoryService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const { data } = await apiClient.get<PaginatedResponse<Category>>(ENDPOINTS.CATEGORIES.BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(ENDPOINTS.CATEGORIES.BY_ID(id));
    return data;
  },

  create: async (payload: CategoryCreate): Promise<Category> => {
    const { data } = await apiClient.post<Category>(ENDPOINTS.CATEGORIES.BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CategoryCreate>): Promise<Category> => {
    const { data } = await apiClient.put<Category>(ENDPOINTS.CATEGORIES.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.CATEGORIES.BY_ID(id));
  },
};
