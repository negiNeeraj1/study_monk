import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Maximize,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const {
    darkMode,
    setDarkMode,
    notifications,
    currentUser,
    showToast,
    refreshData,
    loading,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for: ${searchQuery}`, "info");
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");

    // Show logout message
    showToast("Logged out successfully", "success");

    // Close user menu
    setShowUserMenu(false);

    // Redirect to login
    navigate("/login", { replace: true });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      showToast("Entered fullscreen mode", "info");
    } else {
      document.exitFullscreen();
      showToast("Exited fullscreen mode", "info");
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 glass-card border-b border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <motion.button
              id="mobile-menu-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </motion.button>

            {/* Brand */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyAI Admin
              </h1>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center"
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, materials, quizzes..."
                  className="pl-10 pr-4 py-2 w-80 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: loading ? 360 : 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <RefreshCw
                size={18}
                className={`text-gray-600 dark:text-gray-300 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </motion.button>

            {/* Fullscreen Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <Maximize
                size={18}
                className="text-gray-600 dark:text-gray-300"
              />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={18} className="text-yellow-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={18} className="text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-50"
                  >
                    <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className="p-3 border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.read
                                    ? "bg-gray-300"
                                    : "bg-blue-500"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {notification.timestamp || "Just now"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-600 dark:text-gray-300 hidden sm:block"
                />
              </motion.button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-50"
                  >
                    <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentUser.email}
                      </p>
                      <span className="inline-block px-2 py-1 mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="p-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <User size={16} className="mr-3" />
                        Profile Settings
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings size={16} className="mr-3" />
                        Preferences
                      </motion.button>
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2" />
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
