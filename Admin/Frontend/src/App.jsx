import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import Layout from "./components/layout/Layout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import UserManagement from "./components/user/UserManagement";
import MaterialManagement from "./components/materials/MaterialManagement";
import QuizManagement from "./components/quiz/QuizManagement";
import FileUpload from "./components/upload/FileUpload";
import Analytics from "./components/analytics/Analytics";
import Reports from "./components/reports/Reports";
import Achievements from "./components/achievements/Achievements";
import Notifications from "./components/notifications/Notifications";
import Security from "./components/security/Security";
import Settings from "./components/settings/Settings";
import Help from "./components/help/Help";
import AdminDebugPanel from "./components/ui/DebugPanel";
import Login from "./components/auth/Login";
import "./index.css";

const App = () => {
  return (
    <DashboardProvider>
      <>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="login" element={<Login />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="materials" element={<MaterialManagement />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="upload" element={<FileUpload />} />
            <Route path="reports" element={<Reports />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="security" element={<Security />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
        {/* Admin Debug Panel - only shows in development mode */}
        <AdminDebugPanel />
      </>
    </DashboardProvider>
  );
};

export default App;
