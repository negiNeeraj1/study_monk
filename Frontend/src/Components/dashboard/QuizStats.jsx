import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  Zap,
  Calendar,
  Star,
  RefreshCw,
} from "lucide-react";
import quizAttemptService from "../../services/quizAttemptService";

const QuizStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await quizAttemptService.getDashboardStats();

      if (response.success) {
        setStats(response.data);
        setError("");
      }
    } catch (err) {
      console.error("Failed to load quiz stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-lg animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <button
          onClick={loadStats}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats || !stats.overview) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Start Your Learning Journey
        </h3>
        <p className="text-gray-500 mb-4">
          Take your first quiz to see your progress and statistics!
        </p>
        <a
          href="/quizzes"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Take Your First Quiz
        </a>
      </div>
    );
  }

  const { overview, subjectPerformance, difficultyBreakdown, learningStreak } =
    stats;

  const statCards = [
    {
      title: "Total Quizzes",
      value: overview.totalAttempts,
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Average Score",
      value: `${Math.round(overview.averageScore)}%`,
      icon: <Target className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Pass Rate",
      value: `${overview.passRate}%`,
      icon: <Trophy className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      title: "Learning Streak",
      value: `${learningStreak} days`,
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <div className={stat.textColor}>{stat.icon}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Subject Performance
            </h3>
            <button
              onClick={loadStats}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {subjectPerformance && subjectPerformance.length > 0 ? (
            <div className="space-y-4">
              {subjectPerformance.slice(0, 5).map((subject, index) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {subject.subject}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {subject.attempts} attempts
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {subject.averageScore}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        subject.averageScore >= 80
                          ? "bg-green-500"
                          : subject.averageScore >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${subject.averageScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No subject performance data yet
            </div>
          )}
        </motion.div>

        {/* Difficulty Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Difficulty Breakdown
          </h3>

          {difficultyBreakdown && difficultyBreakdown.length > 0 ? (
            <div className="space-y-4">
              {difficultyBreakdown.map((difficulty) => {
                const difficultyColors = {
                  beginner: {
                    bg: "bg-green-100",
                    text: "text-green-600",
                    bar: "bg-green-500",
                  },
                  intermediate: {
                    bg: "bg-orange-100",
                    text: "text-orange-600",
                    bar: "bg-orange-500",
                  },
                  advanced: {
                    bg: "bg-purple-100",
                    text: "text-purple-600",
                    bar: "bg-purple-500",
                  },
                };

                const colors =
                  difficultyColors[difficulty.difficulty] ||
                  difficultyColors.beginner;

                return (
                  <div key={difficulty.difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {difficulty.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {difficulty.attempts} attempts
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {difficulty.passRate}% pass rate
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${difficulty.passRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No difficulty breakdown data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(overview.totalTimeTaken / 60)}h
          </div>
          <div className="text-sm text-gray-600">Total Study Time</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Star className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overview.bestScore}%
          </div>
          <div className="text-sm text-gray-600">Best Score</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overview.totalPassed}
          </div>
          <div className="text-sm text-gray-600">Quizzes Passed</div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizStats;
