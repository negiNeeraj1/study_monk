import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  BookOpen,
  Upload,
  Settings,
  BarChart3,
  FileText,
  Brain,
  Award,
  Bell,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, analytics } = useDashboard();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
      badge: null,
      group: "main",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      badge: null,
      group: "main",
    },
    {
      id: "test",
      label: "Sidebar Test",
      icon: HelpCircle,
      path: "/admin/test",
      badge: "Test",
      group: "main",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      badge: analytics?.totalUsers > 10000 ? "10K+" : null,
      group: "management",
    },
    {
      id: "materials",
      label: "Study Materials",
      icon: BookOpen,
      path: "/admin/materials",
      badge: null,
      group: "management",
    },
    {
      id: "quizzes",
      label: "Quiz Management",
      icon: Brain,
      path: "/admin/quizzes",
      badge: null,
      group: "management",
    },
    {
      id: "upload",
      label: "File Upload",
      icon: Upload,
      path: "/admin/upload",
      badge: null,
      group: "content",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
      badge: null,
      group: "content",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Award,
      path: "/admin/achievements",
      badge: "New",
      group: "features",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      badge: null,
      group: "features",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      path: "/admin/security",
      badge: null,
      group: "system",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
      badge: null,
      group: "system",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      path: "/admin/help",
      badge: null,
      group: "system",
    },
    // Additional items to demonstrate scrolling
    {
      id: "backup",
      label: "Backup & Restore",
      icon: Shield,
      path: "/admin/backup",
      badge: null,
      group: "system",
    },
    {
      id: "logs",
      label: "System Logs",
      icon: FileText,
      path: "/admin/logs",
      badge: null,
      group: "system",
    },
    {
      id: "updates",
      label: "System Updates",
      icon: Sparkles,
      path: "/admin/updates",
      badge: "2",
      group: "system",
    },
    {
      id: "monitoring",
      label: "System Monitoring",
      icon: BarChart3,
      path: "/admin/monitoring",
      badge: null,
      group: "system",
    },
    {
      id: "api",
      label: "API Management",
      icon: Settings,
      path: "/admin/api",
      badge: null,
      group: "system",
    },
  ];

  const groupLabels = {
    main: "Main",
    management: "Management",
    content: "Content",
    features: "Features",
    system: "System",
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActivePath = (path) => {
    // Handle dashboard path specifically
    if (
      path === "/admin/dashboard" &&
      (location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard")
    )
      return true;
    // Handle other paths
    if (path !== "/admin/dashboard" && location.pathname.startsWith(path))
      return true;
    return false;
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("admin-sidebar");
      const menuButton = document.getElementById("mobile-menu-button");

      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        menuButton &&
        !menuButton.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, setIsOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed left-0 top-0 h-screen glass-card border-r border-gray-200/50 dark:border-gray-700/50 z-50 lg:relative lg:h-screen lg:translate-x-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-72"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      StudyAI
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Admin Panel
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center space-x-1">
                {/* Collapse Toggle (Desktop) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label={
                    sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {sidebarCollapsed ? (
                    <ChevronRight
                      size={16}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  ) : (
                    <ChevronLeft
                      size={16}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  )}
                </motion.button>

                {/* Close Button (Mobile) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={16} className="text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto py-3 px-2 custom-scrollbar">
              <nav className="space-y-1">
                {Object.entries(groupLabels).map(([groupKey, groupLabel]) => {
                  const groupItems = menuItems.filter(
                    (item) => item.group === groupKey
                  );

                  return (
                    <div key={groupKey} className="mb-4">
                      {!sidebarCollapsed && (
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {groupLabel}
                        </motion.h3>
                      )}

                      <div className="space-y-0.5">
                        {groupItems.map((item, index) => {
                          const Icon = item.icon;
                          const isActive = isActivePath(item.path);

                          return (
                            <motion.button
                              key={item.id}
                              custom={index}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{
                                x: sidebarCollapsed ? 0 : 6,
                                scale: sidebarCollapsed ? 1.1 : 1,
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleNavigation(item.path)}
                              className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                              }`}
                              title={sidebarCollapsed ? item.label : ""}
                              aria-label={item.label}
                            >
                              <Icon
                                size={18}
                                className={`flex-shrink-0 ${
                                  isActive
                                    ? "text-white"
                                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                                }`}
                              />

                              {!sidebarCollapsed && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="ml-3 flex-1 flex items-center justify-between"
                                >
                                  <span className="font-medium text-sm">
                                    {item.label}
                                  </span>

                                  {item.badge && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                        item.badge === "New"
                                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                          : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                      }`}
                                    >
                                      {item.badge}
                                    </motion.span>
                                  )}
                                </motion.div>
                              )}

                              {/* Active Indicator */}
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="glass-card p-3 rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    System Status
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      All Systems Operational
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
