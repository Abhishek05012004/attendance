// Make sure to install nodemailer: npm install nodemailer
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const attendanceRoutes = require("./routes/attendance")
const userRoutes = require("./routes/users")
const leaveRoutes = require("./routes/leave")

const app = express()

// Enhanced CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://attendance-system-frontend.vercel.app",
  // Add your actual frontend URLs here
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        // In production, be more permissive for now
        if (process.env.NODE_ENV === "production") {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
})

// MongoDB connection with better error handling for serverless
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    return
  }

  try {
    console.log("Connecting to MongoDB...")

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set")
    }

    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduced for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1, // Reduced for serverless
      maxIdleTimeMS: 30000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    }

    await mongoose.connect(process.env.MONGO_URI, mongoOptions)
    isConnected = true
    console.log("✅ MongoDB connected successfully")
    console.log("Database name:", mongoose.connection.name)
  } catch (err) {
    console.error("❌ MongoDB connection error:", err)
    isConnected = false
    throw err
  }
}

// Connect to database on startup
connectToDatabase().catch(console.error)

// Middleware to ensure database connection
const ensureDbConnection = async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectToDatabase()
    }
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(500).json({
      error: "Database connection failed",
      message: "Unable to connect to the database. Please try again later.",
    })
  }
}

// Root route - Welcome message
app.get("/", (req, res) => {
  try {
    res.json({
      message: "🎉 Employee Attendance System API is running!",
      status: "active",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/api/health",
        auth: "/api/auth/*",
        attendance: "/api/attendance/*",
        users: "/api/users/*",
        leave: "/api/leave/*",
      },
      documentation: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        health_check: "GET /api/health",
      },
    })
  } catch (error) {
    console.error("Root route error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  try {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      environment: {
        mongoUri: !!process.env.MONGO_URI,
        jwtSecret: !!process.env.JWT_SECRET,
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
        nodeEnv: process.env.NODE_ENV || "development",
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(500).json({ error: "Health check failed" })
  }
})

// Apply database connection middleware to API routes
app.use("/api", ensureDbConnection)

// Routes with error handling
app.use("/api/auth", (req, res, next) => {
  try {
    authRoutes(req, res, next)
  } catch (error) {
    console.error("Auth route error:", error)
    res.status(500).json({ error: "Auth service error" })
  }
})

app.use("/api/attendance", (req, res, next) => {
  try {
    attendanceRoutes(req, res, next)
  } catch (error) {
    console.error("Attendance route error:", error)
    res.status(500).json({ error: "Attendance service error" })
  }
})

app.use("/api/users", (req, res, next) => {
  try {
    userRoutes(req, res, next)
  } catch (error) {
    console.error("Users route error:", error)
    res.status(500).json({ error: "Users service error" })
  }
})

app.use("/api/leave", (req, res, next) => {
  try {
    leaveRoutes(req, res, next)
  } catch (error) {
    console.error("Leave route error:", error)
    res.status(500).json({ error: "Leave service error" })
  }
})

// API documentation endpoint
app.get("/api", (req, res) => {
  try {
    res.json({
      message: "Employee Attendance System API",
      version: "1.0.0",
      endpoints: {
        Authentication: {
          "POST /api/auth/login": "Login with email and password",
          "POST /api/auth/register": "Register new user (requires admin approval)",
          "POST /api/auth/forgot-password": "Request password reset",
          "POST /api/auth/reset-password": "Reset password with token",
          "GET /api/auth/profile": "Get user profile",
          "GET /api/auth/notifications": "Get user notifications",
          "GET /api/auth/registration-requests": "Get registration requests (admin only)",
        },
        Attendance: {
          "POST /api/attendance/checkin": "Check in for work",
          "POST /api/attendance/checkout": "Check out from work",
          "GET /api/attendance/status": "Get current attendance status",
          "GET /api/attendance/logs": "Get attendance logs",
          "GET /api/attendance/stats": "Get attendance statistics",
          "GET /api/attendance/report": "Generate attendance report",
          "GET /api/attendance/download-report": "Download attendance report as CSV",
        },
        Users: {
          "GET /api/users": "Get all users (admin/manager/hr only)",
          "PUT /api/users/:id": "Update user (admin/hr only)",
          "DELETE /api/users/:id": "Deactivate user (admin/hr only)",
          "GET /api/users/dashboard-stats": "Get dashboard statistics",
          "GET /api/users/departments": "Get all departments",
        },
        Leave: {
          "POST /api/leave/request": "Submit leave request",
          "GET /api/leave/requests": "Get leave requests",
          "PUT /api/leave/requests/:id": "Approve/reject leave request",
          "GET /api/leave/stats": "Get leave statistics",
        },
      },
    })
  } catch (error) {
    console.error("API docs error:", error)
    res.status(500).json({ error: "API documentation error" })
  }
})

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  console.log("404 - API route not found:", req.originalUrl)
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
    method: req.method,
    message: "The requested API endpoint does not exist. Check /api for available endpoints.",
  })
})

// 404 handler for all other routes
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.originalUrl)
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    message: "This is an API server. Visit / for API information or /api/health for health check.",
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err)

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy violation",
      message: "This origin is not allowed to access this API",
    })
  }

  // MongoDB errors
  if (err.name === "MongoError" || err.name === "MongooseError") {
    return res.status(500).json({
      error: "Database error",
      message: "Database operation failed",
    })
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on the server",
  })
})

// For serverless functions, we don't need to listen on a port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 API Documentation: http://localhost:${PORT}/api`)
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`)
    console.log(`📊 Root endpoint: http://localhost:${PORT}/`)
  })
}

// Export for Vercel
module.exports = app
