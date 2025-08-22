import React from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Upload, 
  Users, 
  FileText, 
  Brain, 
  Settings,
  Download,
  RefreshCw
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const QuickActions = () => {
  const { showToast } = useDashboard();

  const actions = [
    {
      id: "add-user",
      label: "Add User",
      icon: Plus,
      color: "from-blue-500 to-blue-600",
      onClick: () => showToast("Opening user creation form...", "info")
    },
    {
      id: "upload-material",
      label: "Upload Material",
      icon: Upload,
      color: "from-purple-500 to-purple-600",
      onClick: () => showToast("Opening file upload...", "info")
    },
    {
      id: "create-quiz",
      label: "Create Quiz",
      icon: Brain,
      color: "from-green-500 to-green-600",
      onClick: () => showToast("Opening quiz creator...", "info")
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: FileText,
      color: "from-yellow-500 to-yellow-600",
      onClick: () => showToast("Generating report...", "info")
    },
    {
      id: "export-data",
      label: "Export Data",
      icon: Download,
      color: "from-indigo-500 to-indigo-600",
      onClick: () => showToast("Preparing data export...", "info")
    },
    {
      id: "system-settings",
      label: "Settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      onClick: () => showToast("Opening settings...", "info")
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Quick Actions
        </h3>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className="text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="group relative p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${action.color} p-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <Icon size={24} className="text-white w-full h-full" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {action.label}
                </span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out pointer-events-none rounded-xl" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickActions;
