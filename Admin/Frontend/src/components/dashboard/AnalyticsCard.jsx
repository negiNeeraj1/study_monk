import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import AnimatedCounter from "../ui/AnimatedCounter";

const AnalyticsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const isPositive = stat.change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="relative group overflow-hidden"
    >
      <div className="glass-card p-4 sm:p-6 rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div
              className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}
            >
              <Icon size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            
            {/* Change Indicator */}
            <div className={`flex items-center space-x-1 text-xs sm:text-sm font-semibold ${
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {isPositive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>
                {isPositive ? "+" : ""}{stat.change}%
              </span>
            </div>
          </div>

          {/* Main Value */}
          <div className="mb-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter 
                end={stat.value} 
                duration={2}
                prefix={stat.id === 'revenue' ? '$' : ''}
                suffix={stat.id === 'revenue' ? 'K' : ''}
              />
            </h3>
          </div>

          {/* Title and Description */}
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              {stat.title}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.description}
            </p>
          </div>

          {/* Progress Bar for certain metrics */}
          {(stat.id === 'quiz-completions' || stat.id === 'revenue') && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Goal Progress</span>
                <span>
                  {stat.id === 'quiz-completions' ? '87%' : '78%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: stat.id === 'quiz-completions' ? '87%' : '78%' 
                  }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`}
                />
              </div>
            </div>
          )}

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
