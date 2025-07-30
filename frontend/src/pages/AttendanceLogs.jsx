"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Calendar, Clock, Filter, Users, UserCheck, UserX, Plane } from "lucide-react"
import API from "../services/api"

export default function AttendanceLogs() {
  const { user, isAdmin } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date: "", // Will be set to today's date
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // FIXED: Get today's date correctly
  const getTodaysDate = () => {
    const today = new Date()
    // Ensure we get the local date, not UTC
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const todayString = `${year}-${month}-${day}`
    console.log("Today's date:", todayString)
    return todayString
  }

  useEffect(() => {
    // Set default date to today - FIXED
    const todayDate = getTodaysDate()
    console.log("Setting default date to:", todayDate)
    setFilters({ date: todayDate })
  }, [])

  useEffect(() => {
    if (filters.date) {
      console.log("Fetching logs for date:", filters.date)
      fetchLogs()
    }
  }, [filters, pagination.currentPage])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.currentPage,
        limit: 10,
        date: filters.date,
      }

      console.log("API call params:", params)
      const res = await API.get("/attendance/logs", { params })
      console.log("API response:", res.data)
      setLogs(res.data.logs)
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total,
      })
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    console.log("Filter change:", field, value)
    setFilters({ ...filters, [field]: value })
    setPagination({ ...pagination, currentPage: 1 })
  }

  // FIXED: Reset to today function
  const resetToToday = () => {
    const todayDate = getTodaysDate()
    console.log("Resetting to today:", todayDate)
    setFilters({ date: todayDate })
    setPagination({ ...pagination, currentPage: 1 })
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
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (log) => {
    if (log.isLeave) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          <Plane className="w-3 h-3 mr-1" />
          On Leave ({log.leaveType})
        </span>
      )
    }

    if (log.isAbsent || !log.checkIn) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <UserX className="w-3 h-3 mr-1" />
          Absent
        </span>
      )
    }

    if (log.checkIn && log.checkOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <UserCheck className="w-3 h-3 mr-1" />
          Complete
        </span>
      )
    }

    if (log.checkIn && !log.checkOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
        Unknown
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-600">View and manage attendance records</p>
        </div>
      </div>

      {/* FIXED Filters - Only Date */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetToToday}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset to Today
            </button>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div>Today: {getTodaysDate()}</div>
              <div>Selected: {filters.date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            <Users className="w-5 h-5 inline mr-2" />
            Attendance Records ({pagination.total} total)
            {filters.date && (
              <span className="ml-2 text-sm font-normal text-gray-600">for {formatDate(filters.date)}</span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-medium">
                            {log.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user?.name}</div>
                          <div className="text-sm text-gray-500">{log.user?.employeeId}</div>
                          <div className="text-xs text-gray-400">{log.user?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(log.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatTime(log.checkIn)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-red-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatTime(log.checkOut)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {log.workingHours ? `${log.workingHours}h` : "--"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records found for the selected date</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
              {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
