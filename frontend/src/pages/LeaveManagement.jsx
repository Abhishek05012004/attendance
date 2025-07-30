"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Users, UserX } from "lucide-react"
import API from "../services/api"

export default function LeaveManagement() {
  const { user, isAdmin } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [employeesOnLeave, setEmployeesOnLeave] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingEmployeesOnLeave, setLoadingEmployeesOnLeave] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [newLeave, setNewLeave] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "annual", label: "Annual Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "emergency", label: "Emergency Leave" },
  ]

  // Check if user can approve/reject leaves
  const canManageLeaves = isAdmin || user?.role === "manager" || user?.role === "hr"

  // Get today's date for default filter
  const getTodaysDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    // Set default date to today
    setSelectedDate(getTodaysDate())
  }, [])

  useEffect(() => {
    fetchLeaves()
    fetchStats()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchEmployeesOnLeave()
    }
  }, [selectedDate])

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/requests")
      setLeaves(res.data.leaves)
    } catch (error) {
      console.error("Error fetching leaves:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeesOnLeave = async () => {
    if (!selectedDate) return

    setLoadingEmployeesOnLeave(true)
    try {
      const res = await API.get("/leave/requests")

      // Filter leaves that are active on the selected date and approved
      const activeLeaves = res.data.leaves.filter((leave) => {
        const leaveStart = new Date(leave.startDate)
        const leaveEnd = new Date(leave.endDate)
        const filterDate = new Date(selectedDate)

        // Check if the filter date falls within the leave period and is approved
        return filterDate >= leaveStart && filterDate <= leaveEnd && leave.status === "approved"
      })

      setEmployeesOnLeave(activeLeaves)
    } catch (error) {
      console.error("Error fetching employees on leave:", error)
    } finally {
      setLoadingEmployeesOnLeave(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await API.get("/leave/stats")
      setStats(res.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSubmitLeave = async (e) => {
    e.preventDefault()
    try {
      await API.post("/leave/request", newLeave)
      toast.success("Leave request submitted successfully!")
      setShowRequestForm(false)
      setNewLeave({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      })
      fetchLeaves()
      fetchStats()
      fetchEmployeesOnLeave() // Refresh employees on leave
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit leave request")
    }
  }

  const handleLeaveAction = async (leaveId, action, comments = "") => {
    try {
      await API.put(`/leave/requests/${leaveId}`, { status: action, comments })
      toast.success(`Leave request ${action} successfully!`)
      fetchLeaves()
      fetchStats()
      fetchEmployeesOnLeave() // Refresh employees on leave
    } catch (error) {
      toast.error(`Failed to ${action} leave request`)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const resetToToday = () => {
    setSelectedDate(getTodaysDate())
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
    }

    const badge = badges[status] || badges.pending
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getLeaveTypeBadge = (leaveType) => {
    const colors = {
      sick: "bg-red-100 text-red-800",
      casual: "bg-blue-100 text-blue-800",
      annual: "bg-green-100 text-green-800",
      maternity: "bg-purple-100 text-purple-800",
      emergency: "bg-orange-100 text-orange-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${colors[leaveType] || "bg-gray-100 text-gray-800"}`}
      >
        {leaveType.charAt(0).toUpperCase() + leaveType.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage leave requests and track employee absences</p>
        </div>
        {user?.role === "employee" && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Employees on Leave for Specific Date - Only for Admin/Manager/HR */}
      {canManageLeaves && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                <UserX className="w-5 h-5 inline mr-2" />
                Employees on Leave
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Select Date:</label>
                  <input
                    type="date"
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm"
                    style={{ color: "#111827", backgroundColor: "#ffffff" }}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  <button
                    onClick={resetToToday}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>
            {selectedDate && (
              <p className="text-sm text-gray-600 mt-2">
                Showing employees on leave for {formatDate(selectedDate)} ({employeesOnLeave.length} employees)
              </p>
            )}
          </div>

          {loadingEmployeesOnLeave ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {employeesOnLeave.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeesOnLeave.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-red-600 text-sm font-medium">
                                {leave.user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{leave.user?.name}</div>
                              <div className="text-sm text-gray-500">{leave.user?.employeeId}</div>
                              <div className="text-xs text-gray-400">{leave.user?.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getLeaveTypeBadge(leave.leaveType)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{leave.days} days</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                            {leave.reason}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedDate
                      ? `No employees on leave on ${formatDate(selectedDate)}`
                      : "Select a date to view employees on leave"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leave Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Leave</h3>
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Please provide reason for leave..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORIGINAL SECTION: All Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            <Users className="w-5 h-5 inline mr-2" />
            All Leave Requests ({leaves.length} total)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete list of all leave applications with their current status
          </p>
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
                  {canManageLeaves && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  {canManageLeaves && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    {canManageLeaves && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{leave.user?.name}</div>
                          <div className="text-sm text-gray-500">{leave.user?.employeeId}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">{getLeaveTypeBadge(leave.leaveType)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{leave.days}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(leave.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    {canManageLeaves && leave.status === "pending" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLeaveAction(leave._id, "approved")}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave._id, "rejected")}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                    {canManageLeaves && leave.status !== "pending" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {leaves.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No leave requests found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
