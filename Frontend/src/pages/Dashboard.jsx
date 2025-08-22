import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  Book,
  Star,
  Clock,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import AchievementCard from "../Components/dashboard/AchievementCard";
import StatCard from "../Components/dashboard/StatCard";
import QuizStats from "../Components/dashboard/QuizStats";
import QuizHistory from "../Components/dashboard/QuizHistory";
const Dashboard = () => {
  const performanceData = [
    { month: "Jan", score: 85 },
    { month: "Feb", score: 78 },
    { month: "Mar", score: 90 },
    { month: "Apr", score: 88 },
    { month: "May", score: 92 },
  ];

  const subjectScores = [
    { subject: "Physics", score: 85 },
    { subject: "Chemistry", score: 78 },
    { subject: "Biology", score: 92 },
    { subject: "Math", score: 88 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your quiz performance and learning progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.a
              href="/quizzes"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Take Quiz
            </motion.a>
            <motion.a
              href="/quiz-history"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              View History
            </motion.a>
          </div>
        </div>

        {/* Quiz Statistics */}
        <div className="mb-8">
          <QuizStats />
        </div>

        {/* Recent Quiz History */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Recent Quiz Activity
              </h2>
              <a
                href="/quiz-history"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View All
              </a>
            </div>
            <QuizHistory showAll={false} limit={3} />
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AchievementCard
              title="Quiz Master"
              progress={75}
              icon={<Trophy className="text-orange-500" />}
            />
            <AchievementCard
              title="Study Streak"
              progress={90}
              icon={<Target className="text-blue-500" />}
            />
            <AchievementCard
              title="Subject Expert"
              progress={60}
              icon={<Award className="text-purple-500" />}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
