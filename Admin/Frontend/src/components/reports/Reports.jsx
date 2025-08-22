import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const Reports = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate and manage reports
        </p>
      </div>

      <div className="glass-card p-8 rounded-xl text-center">
        <FileText size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Reporting System Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced reporting features are being developed.
        </p>
      </div>
    </motion.div>
  );
};

export default Reports;
