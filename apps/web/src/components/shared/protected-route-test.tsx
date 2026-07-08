import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "./protected-route";

const mockUseSession = vi.fn();

vi.mock("@/hooks/use-session", () => ({
  useSession: () => mockUseSession(),
}));

function renderProtectedRoute(allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows loading state while session is pending", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true });
    renderProtectedRoute();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when there is no session", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false });
    renderProtectedRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when session exists and no role restriction is set", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "customer" } },
      isPending: false,
    });
    renderProtectedRoute();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children when user's role is in allowedRoles", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "admin" } },
      isPending: false,
    });
    renderProtectedRoute(["admin", "superadmin"]);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to login when user's role is not in allowedRoles", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "cashier" } },
      isPending: false,
    });
    renderProtectedRoute(["admin", "superadmin"]);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});