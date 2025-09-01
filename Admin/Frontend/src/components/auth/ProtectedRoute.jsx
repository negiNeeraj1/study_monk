import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallbackPath = "/login",
  showLoading = true,
}) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Role check required and user doesn't have it
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user's actual role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;
