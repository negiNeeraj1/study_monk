import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserSidebar from "./UserSidebar";
import UserDashboard from "../dashboard/UserDashboard";
import UserProfile from "../user/UserProfile";
import StudyMaterials from "../materials/StudyMaterials";
import QuizCenter from "../quiz/QuizCenter";
import MyProgress from "../progress/MyProgress";
import UserNotifications from "../notifications/UserNotifications";
import UserSettings from "../settings/UserSettings";
import UserHelp from "../help/UserHelp";

const UserLayout = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== "user") {
    return null; // This should never happen due to ProtectedRoute
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* User Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Study Dashboard
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Student Portal
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="materials" element={<StudyMaterials />} />
            <Route path="quizzes" element={<QuizCenter />} />
            <Route path="progress" element={<MyProgress />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="help" element={<UserHelp />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
