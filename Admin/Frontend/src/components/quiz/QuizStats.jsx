import React from "react";
import { Brain, Users, TrendingUp, Award, Clock } from "lucide-react";

const QuizStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Quizzes",
      value: stats?.total || 0,
      icon: Brain,
      color: "from-blue-500 to-blue-600",
      description: "All quizzes created",
    },
    {
      title: "Published Quizzes",
      value: stats?.published || 0,
      icon: Award,
      color: "from-green-500 to-green-600",
      description: "Available to students",
    },
    {
      title: "Total Attempts",
      value: stats?.totalAttempts || 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      description: "Student attempts",
    },
    {
      title: "Average Score",
      value: `${stats?.averageScore || 0}%`,
      icon: TrendingUp,
      color: "from-yellow-500 to-yellow-600",
      description: "Overall performance",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizStats;
