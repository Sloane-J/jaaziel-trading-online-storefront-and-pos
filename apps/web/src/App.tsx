import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoginForm } from "@/features/auth/login-form";
import { AdminDashboard } from "@/pages/dashboard/admin-dashboard";
import { CashierDashboard } from "@/pages/dashboard/cashier-dashboard";
import { StaffDashboard } from "@/pages/dashboard/staff-dashboard";
import { SuperadminDashboard } from "@/pages/dashboard/superadmin-dashboard";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
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
				path="/superadmin"
				element={
					<ProtectedRoute allowedRoles={["superadmin"]}>
						<SuperadminDashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/pos"
				element={
					<ProtectedRoute allowedRoles={["cashier"]}>
						<CashierDashboard />
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
		</Routes>
	);
}

export default App;
