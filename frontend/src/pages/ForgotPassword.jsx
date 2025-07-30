"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Mail, ArrowLeft, Send, CheckCircle, AlertTriangle, Shield, Info } from "lucide-react"
import API from "../services/api"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await API.post("/auth/forgot-password", { email })
      setEmailSent(true)
      toast.success("Password reset instructions sent!")
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to send reset email"
      toast.error(errorMessage)

      if (err.response?.data?.adminNote) {
        console.error("Admin Note:", err.response.data.adminNote)
      }
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
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
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account with <strong>{email}</strong> exists, you will receive password reset instructions
                shortly.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
                </div>
                <p className="text-sm text-blue-700">
                  For security reasons, we don't confirm whether an email exists in our system. Please check your inbox
                  and spam folder.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-600" />
                    <strong>What to do next:</strong>
                  </p>
                  <ul className="text-left space-y-1">
                    <li>• Check your email inbox</li>
                    <li>• Look in your spam/junk folder</li>
                    <li>• Click the reset link in the email</li>
                    <li>• The link expires in 1 hour</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      setEmailSent(false)
                      setEmail("")
                    }}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 ease-in-out gap-2 group"
                  >
                    <Mail className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-200" />
                    Try Different Email
                  </button>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 ease-in-out group"
                  >
                    <span className="flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                      Back to Login
                    </span>
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
          "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(219, 234, 254, 0.7)",
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Mail className="h-6 w-6 text-blue-600" />
              Forgot Password?
            </h2>
            <p className="text-gray-600 mt-2">
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-800">
                <strong>Secure Process:</strong> Password reset links are only sent via email for your security.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email Address
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
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    Send Reset Instructions
                  </span>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 ease-in-out group"
              >
                <span className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back to Login
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
