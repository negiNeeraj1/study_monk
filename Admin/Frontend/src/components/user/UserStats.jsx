import React from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Crown, TrendingUp } from "lucide-react";

const UserStats = ({ users, totalCount = 0 }) => {
  const totalUsers = totalCount || users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      change: "+12.5%"
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      change: "+8.2%"
    },
    {
      label: "Admin Users",
      value: adminUsers,
      icon: Crown,
      color: "from-purple-500 to-purple-600",
      change: "+15.3%"
    },
    {
      label: "Regular Users",
      value: regularUsers,
      icon: TrendingUp,
      color: "from-yellow-500 to-yellow-600",
      change: "+5.1%"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-card p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserStats;
