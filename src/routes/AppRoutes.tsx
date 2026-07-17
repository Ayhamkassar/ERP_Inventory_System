import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "../layouts/MainLayout";

// Lazy loaded pages
const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("../features/products/ProductsPage"));
const CategoriesPage = lazy(() => import("../features/categories/CategoriesPage"));
const SuppliersPage = lazy(() => import("../features/suppliers/SuppliersPage"));
const WarehousesPage = lazy(() => import("../features/warehouses/WarehousesPage"));
const PurchasesPage = lazy(() => import("../features/purchases/PurchasesPage"));
const CreatePurchasePage = lazy(() => import("../features/purchases/CreatePurchasePage"));
const PurchaseDetailPage = lazy(() => import("../features/purchases/PurchaseDetailPage"));
const SalesPage = lazy(() => import("../features/sales/SalesPage"));
const CreateSalePage = lazy(() => import("../features/sales/CreateSalePage"));
const SaleDetailPage = lazy(() => import("../features/sales/SaleDetailPage"));
const TransfersPage = lazy(() => import("../features/transfers/TransfersPage"));
const CreateTransferPage = lazy(() => import("../features/transfers/CreateTransferPage"));
const TransferDetailPage = lazy(() => import("../features/transfers/TransferDetailPage"));
const ReportsPage = lazy(() => import("../features/reports/ReportsPage"));

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <CircularProgress />
  </Box>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />

        <Route path="purchases">
          <Route index element={<PurchasesPage />} />
          <Route path="new" element={<CreatePurchasePage />} />
          <Route path=":id" element={<PurchaseDetailPage />} />
        </Route>

        <Route path="sales">
          <Route index element={<SalesPage />} />
          <Route path="new" element={<CreateSalePage />} />
          <Route path=":id" element={<SaleDetailPage />} />
        </Route>

        <Route path="transfers">
          <Route index element={<TransfersPage />} />
          <Route path="new" element={<CreateTransferPage />} />
          <Route path=":id" element={<TransferDetailPage />} />
        </Route>

        <Route path="reports" element={<ReportsPage />} />
      </Route>

      <Route path="404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  </Suspense>
);
