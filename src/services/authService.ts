import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { AuthResponse, LoginRequest, UserInfo } from "../types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
  },

  me: async (): Promise<UserInfo> => {
    const { data } = await apiClient.get<UserInfo>(ENDPOINTS.AUTH.ME);
    return data;
  },

  storeToken: (token: string, user: UserInfo): void => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },

  clearToken: (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  getToken: (): string | null => localStorage.getItem("auth_token"),

  getUser: (): UserInfo | null => {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    try { return JSON.parse(raw) as UserInfo; } catch { return null; }
  },

  isAuthenticated: (): boolean => !!localStorage.getItem("auth_token"),
};
