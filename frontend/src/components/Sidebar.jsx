"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, Clock, Users, User, BarChart3, Calendar, FileText, UserPlus } from "lucide-react"

export default function Sidebar() {
  const { user, isAdmin } = useAuth()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "employee", "manager", "hr"], // Added "hr"
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: Clock,
      roles: ["admin", "employee", "manager", "hr"], // Added "hr"
    },
    {
      name: "Leave Management",
      href: "/leaves",
      icon: Calendar,
      roles: ["admin", "employee", "manager", "hr"], // Added "hr"
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: BarChart3,
      roles: ["admin"], // Changed from ["admin", "manager", "hr"]
    },
    {
      name: "User Management",
      href: "/users",
      icon: Users,
      roles: ["admin", "hr"], // Added "hr"
    },
    {
      name: "Registration Requests",
      href: "/registration-requests",
      icon: UserPlus,
      roles: ["admin"], // Changed from ["admin", "hr"]
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      roles: ["admin", "employee", "manager", "hr"], // Added "hr"
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AttendanceApp</h2>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-6 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
        </div>

        <div className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {user?.employeeId} • {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
