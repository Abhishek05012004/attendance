"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Briefcase,
  Phone,
  MapPin,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Info,
  Shield,
  LogIn,
} from "lucide-react"
import API from "../services/api"

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    position: "",
    phone: "",
    address: "",
    role: "employee",
    adminCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false)
  const navigate = useNavigate()

  const departments = [
    "Human Resources",
    "Information Technology",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Customer Service",
    "Research & Development",
    "Administration",
    "Legal",
  ]

  const positions = [
    "Software Developer",
    "Senior Software Developer",
    "Team Lead",
    "Project Manager",
    "Product Manager",
    "UI/UX Designer",
    "Data Analyst",
    "DevOps Engineer",
    "Quality Assurance Engineer",
    "Business Analyst",
    "System Administrator",
    "Database Administrator",
    "HR Manager",
    "HR Executive",
    "Finance Manager",
    "Accountant",
    "Marketing Manager",
    "Sales Executive",
    "Customer Support Executive",
    "Operations Manager",
    "Intern",
    "Junior Developer",
    "Senior Manager",
    "Director",
    "Vice President",
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const requiredFields = ["name", "email", "password", "department", "position", "phone", "address", "adminCode"]
    const missingFields = requiredFields.filter((field) => !form[field] || form[field].trim() === "")

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      setLoading(false)
      return
    }

    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        position: form.position,
        phone: form.phone,
        address: form.address,
        role: form.role,
        adminCode: form.adminCode,
      })

      toast.success("Registration request submitted successfully!")
      setRegistrationSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  if (registrationSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(219, 234, 254, 0.7)",
        }}
      >
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Registration Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your registration request has been submitted successfully and is now pending admin approval.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                </div>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• An administrator will review your registration</li>
                  <li>• You'll be notified once your account is approved</li>
                  <li>• After approval, you can login with your credentials</li>
                  <li>• This process may take 1-2 business days</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Registration Details:
                  </p>
                  <p>
                    Email: <strong>{form.email}</strong>
                  </p>
                  <p>
                    Department: <strong>{form.department}</strong>
                  </p>
                  <p>
                    Position: <strong>{form.position}</strong>
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      setRegistrationSubmitted(false)
                      setForm({
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        department: "",
                        position: "",
                        phone: "",
                        address: "",
                        role: "employee",
                        adminCode: "",
                      })
                    }}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                  >
                    Submit Another Registration
                  </button>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Go to Login Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(219, 234, 254, 0.7)",
      }}
    >
      <div className="max-w-2xl w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <UserPlus className="h-8 w-8 text-blue-600" />
              Join Our Team
            </h2>
            <p className="text-gray-600 mt-2">Create your employee account</p>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">
                  <strong>Registration Process:</strong> All registrations require admin approval. Please fill in all
                  fields completely.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
                >
                  <Lock className="h-4 w-4" />
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
                >
                  <Lock className="h-4 w-4" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
                >
                  <Building className="h-4 w-4" />
                  Department *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="department"
                    name="department"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    value={form.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  Position *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="position"
                    name="position"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    value={form.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Admin Code */}
              <div>
                <label
                  htmlFor="adminCode"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  Admin Code *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    placeholder="Enter admin verification code"
                    value={form.adminCode}
                    onChange={(e) => handleInputChange("adminCode", e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Contact your administrator to get the verification code
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Address *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  placeholder="Enter your complete address"
                  value={form.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <User className="h-4 w-4" />
                Role
              </label>
              <div className="relative">
                <select
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  value={form.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Submit Registration Request
                  </span>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors duration-200 ease-in-out"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
