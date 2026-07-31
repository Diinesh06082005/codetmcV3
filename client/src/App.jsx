import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import FullPageLoader from "./components/FullPageLoader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import BroadcastSideBox from "./components/BroadcastSideBox.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { getDefaultAuthenticatedRoute } from "./utils/auth.js";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Room from "./pages/Room.jsx";

function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />;
  }

  return children;
}

function IndexRedirect() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  return (
    <Navigate to={isAuthenticated ? getDefaultAuthenticatedRoute(user) : "/login"} replace />
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: "rgba(13, 17, 26, 0.95)",
            color: "#f8fafc",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<IndexRedirect />} />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <Register />
            </GuestOnlyRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && <BroadcastSideBox />}
    </ErrorBoundary>
  );
}

export default App;
