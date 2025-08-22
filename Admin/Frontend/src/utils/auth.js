/**
 * 🔐 Admin Authentication Utilities
 * Helper functions for managing admin authentication
 */

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("adminToken");
  return !!token;
};

/**
 * Get current auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("adminToken");
};

/**
 * Set auth token
 */
export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Clear auth token and logout
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  // navigation should be handled by the caller using react-router's useNavigate
};

/**
 * Check if user has admin privileges (basic check)
 */
export const isAdmin = () => {
  const user = localStorage.getItem("user");
  if (!user) return false;

  try {
    const userData = JSON.parse(user);
    return userData.role === "admin";
  } catch {
    return false;
  }
};

/**
 * Redirect to login if not authenticated
 */
export const requireAuth = () => isAuthenticated();

/**
 * Get user info from localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};
