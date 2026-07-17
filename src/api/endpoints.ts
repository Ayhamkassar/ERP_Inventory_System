// Central API endpoint definitions
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  // Dashboard
  DASHBOARD: {
    STATS: "/dashboard/stats",
    TOP_SELLING: "/dashboard/top-selling",
    SALES_PURCHASES: "/dashboard/sales-purchases",
    LOW_STOCK: "/dashboard/low-stock",
    RECENT_TRANSACTIONS: "/dashboard/recent-transactions",
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id: string) => `/categories/${id}`,
  },

  // Suppliers
  SUPPLIERS: {
    BASE: "/suppliers",
    BY_ID: (id: string) => `/suppliers/${id}`,
  },

  // Warehouses
  WAREHOUSES: {
    BASE: "/warehouses",
    BY_ID: (id: string) => `/warehouses/${id}`,
  },

  // Products
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
  },

  // Purchases
  PURCHASES: {
    BASE: "/purchases",
    BY_ID: (id: string) => `/purchases/${id}`,
  },

  // Sales
  SALES: {
    BASE: "/sales",
    BY_ID: (id: string) => `/sales/${id}`,
  },

  // Transfers
  TRANSFERS: {
    BASE: "/transfers",
    BY_ID: (id: string) => `/transfers/${id}`,
  },

  // Reports
  REPORTS: {
    INVENTORY: "/reports/inventory",
    SALES: "/reports/sales",
    TOP_SELLING: "/reports/top-selling",
    SUPPLIER_SALES: "/reports/supplier-sales",
    EXPORT_PDF: "/reports/export/pdf",
    EXPORT_EXCEL: "/reports/export/excel",
  },
};
