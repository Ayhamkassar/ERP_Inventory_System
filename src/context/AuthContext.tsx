import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "../services/authService";
import { inventoryHub } from "../signalr/inventoryHub";
import type { UserInfo, LoginRequest } from "../types";

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      authService.storeToken(response.token, response.user);
      setUser(response.user);
      await inventoryHub.start();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    authService.clearToken();
    await inventoryHub.stop();
    setUser(null);
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      inventoryHub.start().catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
