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
  // Add your Vercel frontend URL here when deployed
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Database connection
console.log("Connecting to MongoDB...")
console.log("MongoDB URI:", process.env.MONGO_URI ? "Set" : "Not set")
console.log("JWT Secret:", process.env.JWT_SECRET ? "Set" : "Not set")

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log("Database name:", mongoose.connection.name)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// Root route - Welcome message
app.get("/", (req, res) => {
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
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/users", userRoutes)
app.use("/api/leave", leaveRoutes)

// Health check
app.get("/api/health", (req, res) => {
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
})

// API documentation endpoint
app.get("/api", (req, res) => {
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
})

// Add this before the 404 handler
app.get("/api/auth/login", (req, res) => {
  res.json({
    message: "Login endpoint - use POST method with email and password",
    method: "POST",
    endpoint: "/api/auth/login",
    body: {
      email: "your-email@example.com",
      password: "your-password",
    },
    example:
      'curl -X POST -H \'Content-Type: application/json\' -d \'{"email":"user@example.com","password":"password123"}\' ' +
      req.protocol +
      "://" +
      req.get("host") +
      "/api/auth/login",
  })
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack)

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy violation",
      message: "This origin is not allowed to access this API",
    })
  }

  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on the server",
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 API Documentation: http://localhost:${PORT}/api`)
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`)
  console.log(`📊 Root endpoint: http://localhost:${PORT}/`)
})

// Export for Vercel
module.exports = app
