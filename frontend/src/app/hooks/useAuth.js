import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Convenience hook for consuming the AuthContext.
 *
 * Usage:
 *   const { user, role, isAuthenticated, login, register, logout } = useAuth();
 *
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth() must be used inside <AuthProvider>. " +
        "Wrap your app with <AuthProvider> in App.jsx.",
    );
  }

  return context;
}
