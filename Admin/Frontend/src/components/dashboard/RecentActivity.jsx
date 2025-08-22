import React from "react";
import { motion } from "framer-motion";
import { recentActivities } from "../../data/mockData";
import { MoreHorizontal, ExternalLink } from "lucide-react";

const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass-card p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Recent Activity
        </h3>
        <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <span className="text-sm">View All</span>
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {recentActivities.map((activity, index) => {
          const Icon = activity.icon;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="group flex items-start space-x-3 p-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-lg transition-all duration-200 cursor-pointer"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${activity.color} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={16} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>

              {/* More Options */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all duration-200"
              >
                <MoreHorizontal size={14} className="text-gray-400" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Load More Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-all duration-200"
      >
        Load More Activities
      </motion.button>
    </motion.div>
  );
};

export default RecentActivity;
