import React from 'react'
import { motion } from 'framer-motion';
const QuizLevelCard = ({ level, description, color, icon, onSelect }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 
        ${color} hover:${color.replace('bg-', 'bg-opacity-80')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-white">{icon}</div>
        <h3 className="text-xl font-bold text-white">{level} Level</h3>
      </div>
      <p className="text-white text-opacity-80">{description}</p>
    </motion.div>
  );

export default QuizLevelCard