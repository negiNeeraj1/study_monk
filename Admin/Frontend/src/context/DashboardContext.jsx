import React, { createContext, useContext, useState, useEffect } from "react";
import adminAPI from "../services/api";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-dark-mode") === "true";
    }
    return false;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState({
    name: "Admin User",
    email: "admin@studyai.com",
    avatar: null,
    role: "Super Admin",
    permissions: ["all"],
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQuizzes: 0,
    totalMaterials: 0,
    revenueThisMonth: 0,
    growthRate: 0,
    userRetention: 0,
    averageSessionTime: "0m 0s",
  });

  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // Toast system
  const showToast = (message, type = "info", duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToast(newToast);

    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Notification system
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification, timestamp: new Date() };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep only latest 50
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Theme management
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("admin-dark-mode", darkMode.toString());
  }, [darkMode]);

  // Sidebar state management
  useEffect(() => {
    localStorage.setItem(
      "admin-sidebar-collapsed",
      sidebarCollapsed.toString()
    );
  }, [sidebarCollapsed]);

  // Load dashboard data on mount (only if authenticated)
  useEffect(() => {
    // Check if user is authenticated before loading data
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      loadDashboardData();
    } else {
      console.warn(
        "🚨 No authentication token found, skipping dashboard data load"
      );
      // Don't show toast for unauthenticated users - they'll be redirected to login
    }
  }, []);

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check authentication before making API calls
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      const [dashStats, healthData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemHealth().catch((err) => {
          console.warn("System health check failed:", err.message);
          return null;
        }), // Optional - don't fail if this endpoint has issues
      ]);

      if (dashStats.success) {
        setDashboardStats(dashStats.data);
        setAnalytics({
          totalUsers: dashStats.data.users?.total || 0,
          activeUsers: dashStats.data.users?.active || 0,
          totalQuizzes: dashStats.data.content?.quizzes || 0,
          totalMaterials: dashStats.data.content?.materials || 0,
          revenueThisMonth: 0, // Add if needed
          growthRate: dashStats.data.users?.growthRate || 0,
          userRetention: dashStats.data.performance?.engagementRate || 0,
          averageSessionTime: "24m 32s", // Add calculation if needed
        });
      }

      if (healthData?.success) {
        setSystemHealth(healthData.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);

      // Only show toast if it's not an authentication error
      if (
        !error.message.includes("Authentication required") &&
        !error.message.includes("Session expired")
      ) {
        showToast("Failed to load dashboard data", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time data updates (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    // Theme
    darkMode,
    setDarkMode,

    // Layout
    sidebarCollapsed,
    setSidebarCollapsed,
    activeTab,
    setActiveTab,

    // User
    currentUser,
    setCurrentUser,

    // Data
    analytics,
    setAnalytics,

    // UI State
    loading,
    setLoading,

    // Toast system
    toast,
    showToast,

    // Notifications
    notifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,

    // Data
    dashboardStats,
    systemHealth,

    // Utility functions
    refreshData: loadDashboardData,
    loadDashboardData,

    exportData: (type) => {
      showToast(`Exporting ${type} data...`, "info");
      // Simulate export
      setTimeout(() => {
        showToast(`${type} data exported successfully`, "success");
      }, 2000);
    },

    updateUserProfile: (updates) => {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
      showToast("Profile updated successfully", "success");
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
