import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboard } from "../../context/DashboardContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Users, BookOpen, Brain, TrendingUp } from "lucide-react";
import adminAPI from "../../services/api";
import AnalyticsCard from "./AnalyticsCard";
import ChartComponent from "./ChartComponent";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import PerformanceMetrics from "./PerformanceMetrics";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import { isAuthenticated } from "../../utils/auth";

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const { showToast, analytics, dashboardStats, loadDashboardData } =
    useDashboard();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication before loading data
    if (!isAuthenticated()) {
      showToast("Please login to access admin dashboard", "error");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
      return;
    }

    loadRealData();
  }, [selectedTimeRange]);

  const loadRealData = async () => {
    try {
      setLoading(true);

      // Load dashboard data if not already loaded
      if (!dashboardStats) {
        await loadDashboardData();
      }

      // Load analytics data for charts
      const analyticsData = await adminAPI.getAnalytics(
        selectedTimeRange,
        "overview"
      );

      if (analyticsData.success) {
        // Format data for charts
        setChartData(analyticsData.data.userGrowth || []);
        setPieData(
          analyticsData.data.materialsByCategory?.map((item, index) => ({
            name: item.category,
            value: item.materials,
            color: getColorForIndex(index),
          })) || []
        );
        setUserActivityData(analyticsData.data.quizActivity || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      console.error("Error details:", error.message);

      // Handle specific error types
      if (
        error.message.includes("Authentication required") ||
        error.message.includes("Session expired") ||
        error.message.includes("Access denied")
      ) {
        showToast(
          "Please login to access admin dashboard. Redirecting to login...",
          "error"
        );
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else if (
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network")
      ) {
        showToast(
          "Backend server not connected. Please start the backend server on port 5000.",
          "error"
        );
      } else {
        showToast("Failed to load some dashboard data", "warning");
      }

      // Fallback to sample data for demo
      setChartData([
        { month: "Jan", students: 100, materials: 200 },
        { month: "Feb", students: 150, materials: 250 },
        { month: "Mar", students: 200, materials: 300 },
        { month: "Apr", students: 180, materials: 280 },
        { month: "May", students: 220, materials: 320 },
        { month: "Jun", students: 260, materials: 380 },
      ]);
      setPieData([
        { name: "Programming", value: 35, color: "#3B82F6" },
        { name: "AI & ML", value: 25, color: "#8B5CF6" },
        { name: "Web Dev", value: 20, color: "#10B981" },
        { name: "Database", value: 15, color: "#F59E0B" },
        { name: "Other", value: 5, color: "#EF4444" },
      ]);
      setUserActivityData([
        { time: "00:00", active: 20 },
        { time: "04:00", active: 10 },
        { time: "08:00", active: 80 },
        { time: "12:00", active: 120 },
        { time: "16:00", active: 150 },
        { time: "20:00", active: 90 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getColorForIndex = (index) => {
    const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
    return colors[index % colors.length];
  };

  const getStatsCards = () => {
    return [
      {
        id: "total-users",
        title: "Total Users",
        value: analytics.totalUsers,
        change: analytics.growthRate,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        description: "Registered students",
      },
      {
        id: "active-materials",
        title: "Study Materials",
        value: analytics.totalMaterials,
        change: 8.2, // Could be calculated from API
        icon: BookOpen,
        color: "from-purple-500 to-purple-600",
        description: "Available materials",
      },
      {
        id: "quiz-completions",
        title: "Total Quizzes",
        value: analytics.totalQuizzes,
        change: -3.1, // Could be calculated from API
        icon: Brain,
        color: "from-green-500 to-green-600",
        description: "Published quizzes",
      },
      {
        id: "active-users",
        title: "Active Users",
        value: analytics.activeUsers,
        change: analytics.userRetention,
        icon: TrendingUp,
        color: "from-yellow-500 to-yellow-600",
        description: "Recently active",
      },
    ];
  };

  const timeRanges = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 sm:p-6 rounded-xl">
              <LoadingSkeleton className="h-12 w-12 rounded-lg mb-4" />
              <LoadingSkeleton className="h-6 w-24 mb-2" />
              <LoadingSkeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-4 sm:p-6 rounded-xl">
              <LoadingSkeleton className="h-6 w-32 mb-4" />
              <LoadingSkeleton className="h-64" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-0.5">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            View:
          </span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  selectedTimeRange === range.value
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {getStatsCards().map((stat, index) => (
          <AnalyticsCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Analytics */}
        <ChartComponent title="Monthly Analytics" className="col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey="students"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                name="Students"
              />
              <Bar
                dataKey="materials"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                name="Materials"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartComponent>

        {/* User Activity */}
        <ChartComponent title="User Activity (24h)" className="col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userActivityData}>
              <defs>
                <linearGradient
                  id="activityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#activityGradient)"
                strokeWidth={2}
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartComponent>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Subject Distribution */}
        <ChartComponent title="Subject Distribution" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartComponent>

        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <PerformanceMetrics />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <RecentActivity />

        {/* System Status */}
        <ChartComponent title="System Performance">
          <div className="space-y-4">
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  CPU Usage
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  67%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "67%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Memory</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  82%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-purple-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Storage
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  45%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "45%" }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Network
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  23%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "23%" }}
                  transition={{ duration: 1, delay: 1.1 }}
                  className="bg-yellow-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </ChartComponent>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
