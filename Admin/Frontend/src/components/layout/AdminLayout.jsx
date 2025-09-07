import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import DashboardOverview from "../dashboard/DashboardOverview";
import UserManagement from "../user/UserManagement";
import StudyMaterialManagement from "../materials/StudyMaterialManagement";
import QuizManagement from "../quiz/QuizManagement";
import FileUpload from "../upload/FileUpload";
import Analytics from "../analytics/Analytics";
import Reports from "../reports/Reports";
import Achievements from "../achievements/Achievements";
import Notifications from "../notifications/Notifications";
import Security from "../security/Security";
import Settings from "../settings/Settings";
import Help from "../help/Help";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== "admin") {
    return null; // This should never happen due to ProtectedRoute
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin Panel
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="materials" element={<StudyMaterialManagement />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="upload" element={<FileUpload />} />
            <Route path="reports" element={<Reports />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="security" element={<Security />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route
              path="test"
              element={
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Sidebar Test Page
                  </h2>
                  <p className="text-gray-600">
                    This is a test page to verify sidebar navigation is working
                    correctly.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
