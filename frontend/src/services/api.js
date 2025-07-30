import axios from "axios"

// In-memory token storage for the current session
let authToken = null

const API = axios.create({
  baseURL: "http://localhost:5000/api",
})

// Function to set the token after login and store in sessionStorage
export const setAuthToken = (token) => {
  authToken = token
  sessionStorage.setItem("jwtToken", token) // Store in sessionStorage
}

// Function to clear the token on logout and remove from sessionStorage
export const clearAuthToken = () => {
  authToken = null
  sessionStorage.removeItem("jwtToken") // Remove from sessionStorage
}

// Function to get the token (from in-memory or sessionStorage)
export const getAuthToken = () => {
  if (authToken) {
    return authToken
  }
  // If not in memory, try to retrieve from sessionStorage
  const storedToken = sessionStorage.getItem("jwtToken")
  if (storedToken) {
    authToken = storedToken // Set to in-memory for subsequent requests
    return storedToken
  }
  return null
}

// Request interceptor to add the token
API.interceptors.request.use((req) => {
  const token = getAuthToken() // Always try to get the latest token
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API
