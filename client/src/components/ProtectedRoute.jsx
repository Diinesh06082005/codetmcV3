import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultAuthenticatedRoute } from "../utils/auth.js";
import FullPageLoader from "./FullPageLoader.jsx";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
