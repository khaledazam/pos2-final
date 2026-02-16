import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Home,
  Auth,
  Orders,
  Tables,
  Menu,
  Dashboard,
  InventoryDashboard,
  PlayStationDashboard,
} from "./pages";

import Sidebar from "./components/shared/Sidebar";
import Header from "./components/shared/Header";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import FullScreenLoader from "./components/shared/FullScreenLoader";

import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useSnackbar, SnackbarProvider } from "notistack";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useLoadData from "./hooks/useLoadData";
import { POSProvider } from "./context/posContext";

/* ================= Query Client ================= */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/* ================= Layout ================= */
/* ================= Layout ================= */
function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { isAuth, user } = useSelector((state) => state.user);
  const role = user?.role?.toLowerCase() || "";
  const isAdmin = role === "admin";
  const isCashier = role === "cashier";

  const hideHeaderRoutes = ["/auth"];

  // ✅ STRICT REDIRECT RULES
  useEffect(() => {
    if (!isLoading && isAuth) {
      // 1. Block Cashier from Admin Routes
      const adminRoutes = ["/dashboard", "/inventory"];
      const isTryingAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));

      if (isCashier && isTryingAdminRoute) {
        enqueueSnackbar("Access Denied: Admin Only", { variant: "error" });
        navigate("/pos", { replace: true });
      }

      // 2. Redirect from Root "/"
      if (location.pathname === "/") {
        if (isAdmin) navigate("/dashboard", { replace: true });
        if (isCashier) navigate("/pos", { replace: true });
      }

      // 3. Block Admin from POS (Optional - but user asked for strict Admin->Dashboard)
      // keeping POS accessible to Admin as fallback, but default to Dashboard
    }
  }, [location.pathname, isAuth, isAdmin, isCashier, isLoading, navigate, enqueueSnackbar]);

  if (isLoading) return <FullScreenLoader />;

  const showHeader = !hideHeaderRoutes.includes(location.pathname);
  const showSidebar = isAuth && (isAdmin || isCashier) && showHeader;

  return (
    <div className={`flex min-h-screen ${showSidebar ? "flex-row" : "flex-col"}`}>
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {showHeader && <Header />}

        <main className="flex-1">
          <Routes>
            {/* Auth Route */}
            <Route path="/auth" element={isAuth ? <Navigate to="/" replace /> : <Auth />} />

            {/* Protected Routes */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <Tables />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <Menu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <InventoryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playstation"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <PlayStationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-All -> Redirect to Auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ================= App Wrapper ================= */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3}>
        <Router>
          <POSProvider>
            <Layout />
          </POSProvider>
        </Router>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;