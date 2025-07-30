const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()

// CORS configuration - FIXED
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://attendance-system-one-alpha.vercel.app",
    "https://attendance-system-frontend.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Employee Attendance System API is running!",
    status: "active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.get("/api", (req, res) => {
  res.json({
    message: "Employee Attendance System API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      users: "/api/users/*",
      attendance: "/api/attendance/*",
      leave: "/api/leave/*",
    },
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptime: process.uptime(),
  })
})

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const attendanceRoutes = require("./routes/attendance")
const leaveRoutes = require("./routes/leave")

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/leave", leaveRoutes)

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

// Connect to database
connectDB()

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

// Export for Vercel
module.exports = app
