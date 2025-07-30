"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import Profile from "./pages/Profile"
import AttendanceLogs from "./pages/AttendanceLogs"
import AttendanceReports from "./pages/AttendanceReports"
import UserManagement from "./pages/UserManagement"
import LeaveManagement from "./pages/LeaveManagement"
import RegistrationRequests from "./pages/RegistrationRequests"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider, useAuth } from "./context/AuthContext"

function ReportsRoute() {
  const { user } = useAuth()

  if (user?.role === "admin" || user?.role === "manager" || user?.role === "hr") {
    return <AttendanceReports />
  }

  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
              <Route path="attendance" element={<AttendanceLogs />} />
              <Route path="leaves" element={<LeaveManagement />} />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager", "hr"]}>
                    <ReportsRoute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRoles={["admin", "hr"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="registration-requests"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <RegistrationRequests />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
