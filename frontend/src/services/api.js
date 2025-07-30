import axios from "axios"

// Use environment variable or fallback to your deployed backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://attendance-system-backend-nine.vercel.app/api"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
  verifyToken: () => api.get("/auth/verify"),
}

// User API calls
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getAllUsers: () => api.get("/users"),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getRegistrationRequests: () => api.get("/users/registration-requests"),
  approveRegistration: (id) => api.put(`/users/registration-requests/${id}/approve`),
  rejectRegistration: (id) => api.put(`/users/registration-requests/${id}/reject`),
}

// Attendance API calls
export const attendanceAPI = {
  checkIn: () => api.post("/attendance/checkin"),
  checkOut: () => api.post("/attendance/checkout"),
  getMyAttendance: (params) => api.get("/attendance/my-attendance", { params }),
  getAllAttendance: (params) => api.get("/attendance/all", { params }),
  getAttendanceStats: () => api.get("/attendance/stats"),
  getAttendanceReport: (params) => api.get("/attendance/report", { params }),
}

// Leave API calls
export const leaveAPI = {
  requestLeave: (data) => api.post("/leave/request", data),
  getMyLeaves: () => api.get("/leave/my-leaves"),
  getAllLeaves: () => api.get("/leave/all"),
  updateLeaveStatus: (id, status, reason) => api.put(`/leave/${id}`, { status, reason }),
}

export default api
