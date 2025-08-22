import React from "react";
import { motion } from "framer-motion";
import { dashboardData } from "../../data/mockData";

const PerformanceMetrics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass-card p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Performance Metrics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dashboardData.performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const percentage = (metric.value / metric.target) * 100;
          const isGood = percentage >= 80;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon size={16} className={metric.color} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isGood 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {isGood ? 'Good' : 'Needs Attention'}
                </span>
              </div>

              {/* Value and Target */}
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                  {metric.label.includes('Time') ? 'm' : '%'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Target: {metric.target}{metric.label.includes('Time') ? 'm' : '%'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.8 + index * 0.2 }}
                  className={`h-2 rounded-full ${
                    isGood 
                      ? 'bg-green-500' 
                      : percentage >= 60 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                />
              </div>

              {/* Percentage */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PerformanceMetrics;
