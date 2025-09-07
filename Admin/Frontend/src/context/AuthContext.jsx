import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount and route changes
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch("http://localhost:5001/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
        setToken(storedToken);

        // Redirect based on role if accessing wrong area
        handleRoleBasedRedirect(userData.user.role, location.pathname);
      } else {
        // Token invalid, clear storage
        logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleRoleBasedRedirect = (userRole, currentPath) => {
    // If user is on admin routes but not admin, redirect to user dashboard
    if (currentPath.startsWith("/admin") && userRole !== "admin") {
      navigate("/user/dashboard", { replace: true });
    }

    // If user is on user routes but is admin, redirect to admin dashboard
    if (currentPath.startsWith("/user") && userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType: "admin" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setToken(data.token);

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }

      return { success: true, user: data.user };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    navigate("/login", { replace: true });
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (requiredRole, fallbackPath = "/login") => {
    if (!isAuthenticated) {
      navigate(fallbackPath, { replace: true });
      return false;
    }

    if (!hasRole(requiredRole)) {
      navigate(fallbackPath, { replace: true });
      return false;
    }

    return true;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    token,
    login,
    logout,
    hasRole,
    hasAnyRole,
    canAccess,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
