import React from "react";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: "Quizzes Completed",
      value: user?.totalQuizzes || 0,
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Average Score",
      value: `${user?.averageScore || 0}%`,
      change: "+5%",
      changeType: "positive",
    },
    { name: "Study Hours", value: "24", change: "+2h", changeType: "positive" },
    {
      name: "Materials Read",
      value: "15",
      change: "+3",
      changeType: "positive",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "quiz",
      title: "Mathematics Quiz #5",
      score: 85,
      date: "2 hours ago",
    },
    {
      id: 2,
      type: "material",
      title: "Physics Chapter 3",
      status: "Completed",
      date: "1 day ago",
    },
    {
      id: 3,
      type: "quiz",
      title: "Chemistry Quiz #3",
      score: 92,
      date: "2 days ago",
    },
    {
      id: 4,
      type: "material",
      title: "Biology Chapter 2",
      status: "In Progress",
      date: "3 days ago",
    },
  ];

  const quickActions = [
    {
      name: "Start New Quiz",
      href: "/user/quizzes",
      icon: "📝",
      color: "bg-blue-500",
    },
    {
      name: "Study Materials",
      href: "/user/materials",
      icon: "📚",
      color: "bg-green-500",
    },
    {
      name: "View Progress",
      href: "/user/progress",
      icon: "📊",
      color: "bg-purple-500",
    },
    {
      name: "Notifications",
      href: "/user/notifications",
      icon: "🔔",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-2xl mb-2`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {action.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "quiz"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {activity.type === "quiz" ? "📝" : "📚"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.type === "quiz" ? (
                  <span className="text-sm font-medium text-blue-600">
                    Score: {activity.score}%
                  </span>
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      activity.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Study Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Active Recall</h3>
            <p className="text-sm text-gray-600">
              Test yourself regularly instead of just re-reading materials.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Spaced Repetition
            </h3>
            <p className="text-sm text-gray-600">
              Review concepts at increasing intervals for better retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
