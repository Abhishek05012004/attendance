import axios from "axios"

// In-memory token storage for the current session
let authToken = null

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://attendance-system-backend-nine.vercel.app/api",
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to false for cross-origin requests
})

// Function to set the token after login and store in sessionStorage
export const setAuthToken = (token) => {
  authToken = token
  sessionStorage.setItem("jwtToken", token)
}

// Function to clear the token on logout and remove from sessionStorage
export const clearAuthToken = () => {
  authToken = null
  sessionStorage.removeItem("jwtToken")
}

// Function to get the token (from in-memory or sessionStorage)
export const getAuthToken = () => {
  if (authToken) {
    return authToken
  }
  const storedToken = sessionStorage.getItem("jwtToken")
  if (storedToken) {
    authToken = storedToken
    return storedToken
  }
  return null
}

// Request interceptor to add the token
API.interceptors.request.use(
  (req) => {
    const token = getAuthToken()
    if (token) {
      req.headers.Authorization = `Bearer ${token}`
    }

    // Add some debugging for development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${req.method?.toUpperCase()} ${req.url}`)
    }

    return req
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message)

    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthToken()
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default API
