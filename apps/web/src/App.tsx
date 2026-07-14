import { Outlet, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoginForm } from "@/features/auth/login-form";
import { PosSaleProvider } from "@/features/pos/context/pos-sale-context";
import { AdminCategoriesPage } from "@/pages/dashboard/admin/categories";
import { AdminOrderDetailPage } from "@/pages/dashboard/admin/order-detail";
import { AdminOrdersPage } from "@/pages/dashboard/admin/orders";
import { AdminProductsPage } from "@/pages/dashboard/admin/products";
import { AdminSettingsPage } from "@/pages/dashboard/admin/settings";
import { AdminStorefrontPage } from "@/pages/dashboard/admin/storefront";
import { AdminDashboard } from "@/pages/dashboard/admin-dashboard";
//import { CashierDashboard } from "@/pages/dashboard/cashier-dashboard";
import { PosPaymentPage } from "@/pages/dashboard/pos/pos-payment";
import { PosScreen } from "@/pages/dashboard/pos/pos-screen";
import { StaffDashboard } from "@/pages/dashboard/staff-dashboard";
import { SuperadminDashboard } from "@/pages/dashboard/superadmin-dashboard";
import { CategoryPage } from "@/pages/storefront/category";
import { ContactPage } from "@/pages/storefront/contact";
import { StorefrontHomePage } from "@/pages/storefront/home";
import { ProductDetailPage } from "@/pages/storefront/product-detail";
import { SearchResultsPage } from "@/pages/storefront/search";

function PosLayout() {
  return (
    <PosSaleProvider>
      <Outlet />
    </PosSaleProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontHomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/storefront"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminStorefrontPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperadminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute allowedRoles={["cashier", "admin"]}>
            <PosLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/pos" element={<PosScreen />} />
        <Route path="/pos/payment" element={<PosPaymentPage />} />
      </Route>
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/shop/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
    </Routes>
  );
}

export default App;
