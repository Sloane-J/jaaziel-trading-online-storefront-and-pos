import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router";
import { InstallPromptBanner } from "@/components/shared/install-prompt-banner";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoginForm } from "@/features/auth/login-form";
import { PosSaleProvider } from "@/features/pos/context/pos-sale-context";
import { StorefrontLayout } from "@/features/storefront/storefront-layout";
import { CategoryPage } from "@/pages/storefront/category";
import { CheckoutPage } from "@/pages/storefront/checkout";
import { ContactPage } from "@/pages/storefront/contact";
import { StorefrontHomePage } from "@/pages/storefront/home";
import { ListPropertyPage } from "@/pages/storefront/list-property";
import { OrderConfirmationPage } from "@/pages/storefront/order-confirmation";
import { ProductDetailPage } from "@/pages/storefront/product-detail";
import { ReturnsPage } from "@/pages/storefront/returns";
import { SearchResultsPage } from "@/pages/storefront/search";
import { ServicesPage } from "@/pages/storefront/services";

// Admin, POS, and superadmin routes are lazy-loaded — a storefrostnt visitor
// never downloads this code (including the heavy Recharts dependency).
const AdminDashboard = lazy(() =>
  import("@/pages/dashboard/admin-dashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminCategoriesPage = lazy(() =>
  import("@/pages/dashboard/admin/categories").then((m) => ({
    default: m.AdminCategoriesPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import("@/pages/dashboard/admin/products").then((m) => ({
    default: m.AdminProductsPage,
  })),
);
const AdminStorefrontPage = lazy(() =>
  import("@/pages/dashboard/admin/storefront").then((m) => ({
    default: m.AdminStorefrontPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import("@/pages/dashboard/admin/orders").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);
const AdminOrderDetailPage = lazy(() =>
  import("@/pages/dashboard/admin/order-detail").then((m) => ({
    default: m.AdminOrderDetailPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/dashboard/admin/settings").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);
const AdminStaffPage = lazy(() =>
  import("@/pages/dashboard/admin/staff").then((m) => ({
    default: m.AdminStaffPage,
  })),
);
const AdminActivityLogPage = lazy(() =>
  import("@/pages/dashboard/admin/activity-logs").then((m) => ({
    default: m.AdminActivityLogPage,
  })),
);
const AdminReportsPage = lazy(() =>
  import("@/pages/dashboard/admin/reports").then((m) => ({
    default: m.AdminReportsPage,
  })),
);
const SuperadminDashboard = lazy(() =>
  import("@/pages/dashboard/superadmin-dashboard").then((m) => ({
    default: m.SuperadminDashboard,
  })),
);
const SuperadminOrdersPage = lazy(() =>
  import("@/pages/dashboard/superadmin/orders").then((m) => ({
    default: m.SuperadminOrdersPage,
  })),
);
// Not yet built — uncomment as each page is created.
const SuperadminDataIntegrityPage = lazy(() =>
  import("@/pages/dashboard/superadmin/data-integrity").then((m) => ({
    default: m.SuperadminDataIntegrityPage,
  })),
);
const SuperadminStorefrontPage = lazy(() =>
  import("@/pages/dashboard/superadmin/storefront").then((m) => ({
    default: m.SuperadminStorefrontPage,
  })),
);
const SuperadminHealthPage = lazy(() =>
  import("@/pages/dashboard/superadmin/health").then((m) => ({
    default: m.SuperadminHealthPage,
  })),
);
const SuperadminMultiTenantPage = lazy(() =>
  import("@/pages/dashboard/superadmin/multi-tenant").then((m) => ({
    default: m.SuperadminMultiTenantPage,
  })),
);
const SuperadminSettingsPage = lazy(() =>
  import("@/pages/dashboard/superadmin/settings").then((m) => ({
    default: m.SuperadminSettingsPage,
  })),
);
const StaffDashboard = lazy(() =>
  import("@/pages/dashboard/staff-dashboard").then((m) => ({
    default: m.StaffDashboard,
  })),
);
const PosScreen = lazy(() =>
  import("@/pages/dashboard/pos/pos-screen").then((m) => ({
    default: m.PosScreen,
  })),
);
const PosPaymentPage = lazy(() =>
  import("@/pages/dashboard/pos/pos-payment").then((m) => ({
    default: m.PosPaymentPage,
  })),
);

function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const AdminReturnsPage = lazy(() =>
  import("@/pages/dashboard/admin/returns").then((m) => ({
    default: m.AdminReturnsPage,
  })),
);
const AdminReturnDetailPage = lazy(() =>
  import("@/pages/dashboard/admin/return-detail").then((m) => ({
    default: m.AdminReturnDetailPage,
  })),
);
const AdminPropertySubmissionsPage = lazy(() =>
  import("@/pages/dashboard/admin/property-submissions").then((m) => ({
    default: m.AdminPropertySubmissionsPage,
  })),
);

function PosLayout() {
  return (
    <PosSaleProvider>
      <Outlet />
    </PosSaleProvider>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Storefront routes — wrapped in StorefrontLayout so the
            .storefront-theme class scopes the storefront palette
            to only these pages. */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<StorefrontHomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/shop/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/list-property" element={<ListPropertyPage />} />
          <Route
            path="/order-confirmation/:id"
            element={<OrderConfirmationPage />}
          />
        </Route>

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
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminActivityLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReportsPage />
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
        <Route
          path="/admin/returns"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReturnsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/returns/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReturnDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/property-submissions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPropertySubmissionsPage />
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
          path="/superadmin/orders"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminOrdersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/superadmin/data-integrity"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminDataIntegrityPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/superadmin/storefront"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminStorefrontPage />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/superadmin/health"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminHealthPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/superadmin/multi-tenant"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminMultiTenantPage />
            </ProtectedRoute>
          }
        />
     
        <Route
          path="/superadmin/settings"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperadminSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
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
      </Routes>
      <InstallPromptBanner />
    </Suspense>
  );
}

export default App;