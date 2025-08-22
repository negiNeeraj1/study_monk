import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Search, Filter } from "lucide-react";

const MaterialManagement = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Study Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and organize all study materials
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
          <Plus size={18} />
          <span>Add Material</span>
        </button>
      </div>

      <div className="glass-card p-8 rounded-xl text-center">
        <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Material Management Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature is under development and will be available soon.
        </p>
      </div>
    </motion.div>
  );
};

export default MaterialManagement;
