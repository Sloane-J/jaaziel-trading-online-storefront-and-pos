import { Navigate } from "react-router";
import { useSession } from "@/hooks/use-session";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { data: session, isPending } = useSession();

  if (isPending) return <p>Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes((session.user as any).role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}