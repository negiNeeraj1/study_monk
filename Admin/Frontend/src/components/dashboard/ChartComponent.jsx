import React from "react";
import { motion } from "framer-motion";

const ChartComponent = ({
  title,
  children,
  className = "",
  actions = null,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, duration: 0.5 }}
    whileHover={{
      y: -2,
      transition: { duration: 0.2 },
    }}
    className={`glass-card p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h3>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>

    {/* Chart Container */}
    <div className="h-64 sm:h-72 lg:h-80 xl:h-96 relative">
      <div className="absolute inset-0">{children}</div>
    </div>

    {/* Decorative gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
  </motion.div>
);

export default ChartComponent;
