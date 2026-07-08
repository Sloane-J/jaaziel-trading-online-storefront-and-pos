import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoginForm } from "@/features/auth/login-form";

function Dashboard() {
	return <p>Dashboard — role-based views coming next</p>;
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<LoginForm />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}

export default App;
