"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { User, LogOut, Bell } from "lucide-react" // Removed Search icon
import { clearAuthToken } from "../services/api"
import API from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState([])
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)

  const handleLogout = () => {
    clearAuthToken()
    logout()
    setShowDropdown(false)
  }

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    try {
      const res = await API.get("/auth/notifications")
      setUnreadNotifications(res.data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Function to mark notification as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      await API.put(`/auth/notifications/${notification._id}/read`)
      setUnreadNotifications((prev) => prev.filter((n) => n._id !== notification._id))
      setShowNotificationsDropdown(false)
      navigate(notification.link)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Effect to handle clicks outside the user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  // Effect to handle clicks outside the notifications dropdown
  useEffect(() => {
    function handleClickOutsideNotifications(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false)
      }
    }

    if (showNotificationsDropdown) {
      document.addEventListener("mousedown", handleClickOutsideNotifications)
    } else {
      document.removeEventListener("mousedown", handleClickOutsideNotifications)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideNotifications)
    }
  }, [showNotificationsDropdown])

  // Polling for notifications
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "manager" || user.role === "hr")) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Employee Attendance System</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Removed Search Box */}

          {/* Notifications Icon (visible only for admin, manager, hr) */}
          {(user?.role === "admin" || user?.role === "manager" || user?.role === "hr") && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
                    Notifications
                  </div>
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex flex-col items-start w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">No new notifications</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </a>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
