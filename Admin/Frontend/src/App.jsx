import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import UserLayout from "./components/layout/UserLayout";
import Login from "./components/auth/Login";
import "./index.css";

const App = () => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes - protected with admin role */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin" fallbackPath="/login">
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* User routes - protected with user role */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute requiredRole="user" fallbackPath="/login">
                <UserLayout />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </DashboardProvider>
    </AuthProvider>
  );
};

export default App;
