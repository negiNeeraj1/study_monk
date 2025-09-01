import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);

        // Verify token is still valid
        verifyToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const res = await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
      });

      if (res.data.authenticated) {
        setUser(res.data.user);
        setToken(tokenToVerify);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", tokenToVerify);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      clearAuth();
    }
  };

  const login = async (email, password, userType = "user") => {
    try {
      setError(null);
      setLoading(true);

      const res = await api.post("/auth/login", { email, password, userType });
      const data = res.data;

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        return {
          success: true,
          user: data.user,
          role: data.user.role,
          userType: userType,
        };
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, userType = "user") => {
    try {
      setError(null);
      setLoading(true);

      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
        userType,
      });
      const data = res.data;

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        return {
          success: true,
          user: data.user,
          role: data.user.role,
          userType: userType,
        };
      } else {
        throw new Error(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Signup failed. Please try again.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout endpoint if user is authenticated
      if (token) {
        api
          .post(
            "/auth/logout",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .catch((error) => {
            console.error("Logout API call failed:", error);
          });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);

      const res = await api.put("/auth/profile", updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return {
          success: true,
          user: updatedUser,
        };
      } else {
        throw new Error(res.data.error || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Profile update failed.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      const res = await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
        };
      } else {
        throw new Error(res.data.error || "Password change failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Password change failed.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const refreshToken = async () => {
    try {
      const res = await api.post(
        "/auth/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const newToken = res.data.token;
        setToken(newToken);
        localStorage.setItem("token", newToken);

        return {
          success: true,
          token: newToken,
        };
      } else {
        throw new Error(res.data.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuth();

      return {
        success: false,
        error: "Token refresh failed. Please login again.",
      };
    }
  };

  // Role and permission checking methods
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAtLeastRole = (role) => {
    if (!user) return false;

    const roleHierarchy = ["user", "instructor", "admin", "super_admin"];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);

    return userRoleIndex >= requiredRoleIndex;
  };

  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return (
      user &&
      user.permissions &&
      permissions.some((permission) => user.permissions.includes(permission))
    );
  };

  const hasAllPermissions = (permissions) => {
    return (
      user &&
      user.permissions &&
      permissions.every((permission) => user.permissions.includes(permission))
    );
  };

  // Convenience methods
  const isAdmin = () => isAtLeastRole("admin");
  const isInstructor = () => isAtLeastRole("instructor");
  const isUser = () => hasRole("user");
  const isSuperAdmin = () => hasRole("super_admin");

  // Check if user can access admin panel
  const canAccessAdmin = () => {
    return isAdmin() || isSuperAdmin();
  };

  // Check if user can manage study materials
  const canManageStudyMaterials = () => {
    return (
      hasPermission("manage:study_materials") ||
      hasPermission("create:study_materials") ||
      isAdmin()
    );
  };

  // Check if user can manage quizzes
  const canManageQuizzes = () => {
    return (
      hasPermission("manage:quizzes") ||
      hasPermission("create:quizzes") ||
      isAdmin()
    );
  };

  // Check if user can view analytics
  const canViewAnalytics = () => {
    return (
      hasPermission("read:all_analytics") ||
      hasPermission("read:analytics") ||
      isAdmin()
    );
  };

  const clearError = () => setError(null);

  const contextValue = {
    // State
    user,
    token,
    loading,
    error,

    // Authentication methods
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshToken,

    // Role checking methods
    hasRole,
    isAtLeastRole,
    isAdmin,
    isInstructor,
    isUser,
    isSuperAdmin,

    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Access control methods
    canAccessAdmin,
    canManageStudyMaterials,
    canManageQuizzes,
    canViewAnalytics,

    // Utility methods
    clearError,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
