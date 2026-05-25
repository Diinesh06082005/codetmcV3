import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import FullPageLoader from "./components/FullPageLoader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
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
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            background: "rgba(9, 17, 27, 0.92)",
            color: "#f8fafc",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            boxShadow: "0 18px 44px rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(16px)",
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
    </>
  );
}

export default App;
