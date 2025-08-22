import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

const Achievements = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage achievement systems and rewards
        </p>
      </div>

      <div className="glass-card p-8 rounded-xl text-center">
        <Award size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Achievement System Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Gamification features are under development.
        </p>
      </div>
    </motion.div>
  );
};

export default Achievements;
