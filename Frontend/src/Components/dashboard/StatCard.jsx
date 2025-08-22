import React from 'react'
import {motion} from 'framer-motion';
const StatCard = ({ icon, title, value, change, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white p-6 rounded-xl shadow-lg ${color}`}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className={`mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last week
      </p>
    </motion.div>
  );  
export default StatCard