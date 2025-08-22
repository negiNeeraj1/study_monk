import React from 'react'
import { motion } from 'framer-motion';
const AchievementCard = ({ title, progress, icon }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
    </motion.div>
  );

export default AchievementCard