"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, Building, TrendingUp, Clock, Calendar } from "lucide-react"
import API from "../services/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    departmentStats: [],
  })
  const [recentAttendance, setRecentAttendance] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attendanceRes, leavesRes] = await Promise.all([
        API.get("/users/dashboard-stats"),
        API.get("/users/recent-attendance"),
        API.get("/leave/requests?status=pending&limit=5"),
      ])

      setStats(statsRes.data)
      setRecentAttendance(attendanceRes.data)
      setPendingLeaves(leavesRes.data.leaves)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    if (!time) return "--"
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await API.put(`/leave/requests/${leaveId}`, { status: action })
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error updating leave:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of employee attendance and system statistics</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Today</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards - FIXED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
            <Building className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            {stats.departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dept._id}</p>
                  <p className="text-sm text-gray-600">{dept.count} employees</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{
                        width: `${(dept.count / Math.max(...stats.departmentStats.map((d) => d.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance - FIXED to show today's data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {log.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.user?.name}</p>
                      <p className="text-sm text-gray-600">{log.user?.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(log.checkIn)} - {formatTime(log.checkOut)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Leaves</h3>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>

          <div className="space-y-4">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{leave.user?.name}</p>
                      <p className="text-sm text-gray-600">
                        {leave.leaveType} - {leave.days} days
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{leave.reason}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleLeaveAction(leave._id, "approved")}
                      className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveAction(leave._id, "rejected")}
                      className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
