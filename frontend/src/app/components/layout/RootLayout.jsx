import { Outlet, useLocation } from "react-router";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * RootLayout — shell that wraps authenticated routes with Header + Footer.
 *
 * Role is read from AuthContext (JWT payload), NOT from the URL path.
 * This fixes the critical security bug where visiting /client/* or /expert/*
 * would auto-set the user's role without authentication.
 */
export function RootLayout() {
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();

  // Hide header/footer on standalone auth pages
  const hideHeaderFooter = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
