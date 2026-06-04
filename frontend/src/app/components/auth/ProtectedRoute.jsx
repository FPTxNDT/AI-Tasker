import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * ProtectedRoute — guards routes behind authentication and optional role check.
 *
 * Behaviour:
 * - If the user is NOT authenticated → redirect to /login
 * - If `role` prop is provided and doesn't match the user's role → redirect to /unauthorized
 * - Otherwise → render children via <Outlet />
 *
 * Usage in routes.jsx:
 *   <Route element={<ProtectedRoute role="client">}>
 *     <Route path="client/dashboard" ... />
 *   </Route>
 */
export function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  // While the AuthProvider is restoring session from localStorage,
  // show nothing (or a spinner). This prevents a flash of the login page.
  if (loading) {
    return null;
  }

  // Not logged in — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — send to unauthorized
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorised — render the route's content
  return children ? children : <Outlet />;
}
