// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

// ─── Supplier ─────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

// ─── Warehouse ────────────────────────────────────────────────────────────────
export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseCreate {
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  reorderLevel: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  reorderLevel: number;
  categoryId: string;
}

// ─── Stock ────────────────────────────────────────────────────────────────────
export interface StockItem {
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  batchNumber?: string;
}

// ─── Purchase ─────────────────────────────────────────────────────────────────
export interface PurchaseItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
}

export interface Purchase {
  id: string;
  referenceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  warehouseId: string;
  warehouse?: Warehouse;
  items: PurchaseItem[];
  totalAmount: number;
  status: "pending" | "received" | "cancelled";
  notes?: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseCreate {
  supplierId: string;
  warehouseId: string;
  items: Omit<PurchaseItem, "id" | "product">[];
  notes?: string;
  purchaseDate: string;
}

// ─── Sale ─────────────────────────────────────────────────────────────────────
export interface SaleItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  referenceNumber: string;
  customerId?: string;
  customerName?: string;
  warehouseId: string;
  warehouse?: Warehouse;
  items: SaleItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  saleDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleCreate {
  customerId?: string;
  customerName?: string;
  warehouseId: string;
  items: Omit<SaleItem, "id" | "product">[];
  notes?: string;
  saleDate: string;
}

// ─── Transfer ─────────────────────────────────────────────────────────────────
export interface TransferItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export type TransferStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Transfer {
  id: string;
  referenceNumber: string;
  sourceWarehouseId: string;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId: string;
  destinationWarehouse?: Warehouse;
  items: TransferItem[];
  status: TransferStatus;
  notes?: string;
  transferDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferCreate {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  items: Omit<TransferItem, "id" | "product">[];
  notes?: string;
  transferDate: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  currentStock: number;
  todaySales: number;
  todayPurchases: number;
  todaySalesAmount: number;
  todayPurchasesAmount: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesPurchaseData {
  date: string;
  sales: number;
  purchases: number;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  warehouseName: string;
}

export interface RecentTransaction {
  id: string;
  type: "purchase" | "sale" | "transfer";
  referenceNumber: string;
  amount?: number;
  status: string;
  date: string;
  description: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ReportFilters {
  warehouseId?: string;
  supplierId?: string;
  categoryId?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InventoryReportItem {
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  warehouseName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

export interface SalesReportItem {
  date: string;
  referenceNumber: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  warehouseName: string;
}

export interface SupplierSalesReportItem {
  supplierName: string;
  totalPurchases: number;
  totalAmount: number;
  lastPurchaseDate: string;
}

// ─── SignalR Events ───────────────────────────────────────────────────────────
export interface StockUpdatedEvent {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  previousQuantity: number;
  newQuantity: number;
  changeType: "purchase" | "sale" | "transfer";
}

export interface LowStockEvent {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  reorderLevel: number;
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
