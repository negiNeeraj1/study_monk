// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Enhanced Protected Route Component
 * Provides comprehensive role-based access control for routes
 */

const ProtectedRoute = ({
  children,
  requiredRole = "user",
  requiredPermissions = [],
  anyPermission = false,
  fallbackPath = "/login",
  redirectToAdmin = true,
  showUnauthorizedMessage = true,
}) => {
  const {
    user,
    loading,
    isAdmin,
    isInstructor,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessAdmin,
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole && requiredRole !== "any") {
    const roleHierarchy = ["user", "instructor", "admin", "super_admin"];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      if (showUnauthorizedMessage) {
        return (
          <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You need {requiredRole} privileges to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    let hasAccess = false;

    if (anyPermission) {
      hasAccess = hasAnyPermission(requiredPermissions);
    } else {
      hasAccess = hasAllPermissions(requiredPermissions);
    }

    if (!hasAccess) {
      if (showUnauthorizedMessage) {
        return (
          <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
              <div className="text-red-500 text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Insufficient Permissions
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user is admin trying to access user routes, redirect to admin frontend
  if (redirectToAdmin && canAccessAdmin() && requiredRole === "user") {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === "development";
    const adminUrl = isDevelopment ? "http://localhost:3001" : "https://study-monk-admin-frontend.onrender.com";

    // Use window.location for external redirects
    if (isDevelopment) {
      window.location.href = adminUrl;
      return null;
    } else {
      return <Navigate to={adminUrl} replace />;
    }
  }

  // If user is regular user trying to access admin routes, redirect to user dashboard
  if (requiredRole !== "user" && !canAccessAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is instructor trying to access admin-only routes, redirect to instructor dashboard
  if (requiredRole === "admin" && isInstructor() && !isAdmin()) {
    return <Navigate to="/instructor-dashboard" replace />;
  }

  // All checks passed, render the protected content
  return children;
};

/**
 * Admin Route Component
 * Specifically for admin-only routes
 */
export const AdminRoute = ({ children, fallbackPath = "/login" }) => (
  <ProtectedRoute
    requiredRole="admin"
    fallbackPath={fallbackPath}
    redirectToAdmin={false}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Instructor Route Component
 * For instructor and admin routes
 */
export const InstructorRoute = ({ children, fallbackPath = "/login" }) => (
  <ProtectedRoute
    requiredRole="instructor"
    fallbackPath={fallbackPath}
    redirectToAdmin={false}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Permission-Based Route Component
 * For routes that require specific permissions
 */
export const PermissionRoute = ({
  children,
  permissions = [],
  anyPermission = false,
  fallbackPath = "/dashboard",
}) => (
  <ProtectedRoute
    requiredPermissions={permissions}
    anyPermission={anyPermission}
    fallbackPath={fallbackPath}
    redirectToAdmin={false}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Public Route Component
 * For routes that can be accessed by anyone but show different content for authenticated users
 */
export const PublicRoute = ({ children, fallbackPath = "/dashboard" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
