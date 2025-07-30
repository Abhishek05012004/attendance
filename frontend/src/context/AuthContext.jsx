"use client"

import { createContext, useContext, useState, useEffect } from "react"
import API, { setAuthToken, clearAuthToken, getAuthToken } from "../services/api" // Import getAuthToken

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserFromSession = async () => {
      const token = getAuthToken() // Get token from sessionStorage
      if (token) {
        try {
          // Validate token and fetch user profile
          const res = await API.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setAuthToken(token) // Re-set token in API instance
          setUser(res.data)
        } catch (error) {
          console.error("Failed to load user from session:", error)
          clearAuthToken() // Clear invalid token
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUserFromSession()
  }, [])

  const login = (token, userData) => {
    setAuthToken(token) // Store token in sessionStorage
    setUser(userData)
  }

  const logout = () => {
    clearAuthToken() // Clear token from sessionStorage
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isHR: user?.role === "hr",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
