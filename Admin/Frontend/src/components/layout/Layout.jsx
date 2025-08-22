import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";
import Toast from "../ui/Toast";
import { useDashboard } from "../../context/DashboardContext";

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { darkMode, setDarkMode, sidebarCollapsed, toast, showToast, loading } =
    useDashboard();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById("admin-sidebar");
        const menuButton = document.getElementById("mobile-menu-button");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          menuButton &&
          !menuButton.contains(event.target)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, isClient]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300  ${
        darkMode
          ? "dark bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="lg:flex min-h-screen">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col transition-all duration-300">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <main className="flex-1 relative mt-2">
            {/* Loading Overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Page Content */}
            <div className="px-3 sm:px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-none pt-1"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => showToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Global Keyboard Shortcuts */}
      <div className="hidden">
        <div
          onKeyDown={(e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
              e.preventDefault();
              // Focus search input
              const searchInput = document.querySelector('input[type="text"]');
              if (searchInput) searchInput.focus();
            }

            // Ctrl/Cmd + B for sidebar toggle
            if ((e.ctrlKey || e.metaKey) && e.key === "b") {
              e.preventDefault();
              setSidebarOpen(!sidebarOpen);
            }

            // Ctrl/Cmd + D for dark mode toggle
            if ((e.ctrlKey || e.metaKey) && e.key === "d") {
              e.preventDefault();
              setDarkMode(!darkMode);
            }
          }}
          tabIndex={-1}
          className="fixed inset-0 pointer-events-none"
        />
      </div>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden" />

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default Layout;
