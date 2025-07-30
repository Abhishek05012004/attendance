const express = require("express")
const User = require("../models/User")
const RegistrationRequest = require("../models/RegistrationRequest")
const Notification = require("../models/Notification") // Import Notification model
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const router = express.Router()
const nodemailer = require("nodemailer")

// Admin verification code - In production, this should be in environment variables
const ADMIN_VERIFICATION_CODE = "COMPANY"

// Generate employee ID
const generateEmployeeId = async () => {
  const count = await User.countDocuments()
  return `EMP${String(count + 1).padStart(4, "0")}`
}

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(403).json({ error: "No token provided" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    if (!req.user || !req.user.isActive) return res.status(403).json({ error: "Invalid token or inactive user" })

    next()
  } catch (error) {
    res.status(403).json({ error: "Invalid token" })
  }
}

// Admin auth middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Admin or HR access required" })
  }
  next()
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token." })
  }
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, position, phone, address, role, adminCode } = req.body

    console.log("=== REGISTRATION REQUEST ===")
    console.log("Data received:", { name, email, password, department, position, phone, address, role })

    // Validation - ALL fields are now required
    if (!name || !email || !password || !department || !position || !phone || !address || !adminCode) {
      return res.status(400).json({
        error: "All fields are required: name, email, password, department, position, phone, address, and admin code",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    // Verify admin code
    if (adminCode !== ADMIN_VERIFICATION_CODE) {
      return res.status(400).json({ error: "Invalid admin verification code. Contact your administrator." })
    }

    // Check if user already exists in the main User collection
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Check if there's already a pending registration request for this email
    const existingRequest = await RegistrationRequest.findOne({
      email,
      status: { $in: ["pending", "approved"] },
    })

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          error: "A registration request with this email is already pending admin approval",
        })
      } else if (existingRequest.status === "approved") {
        return res.status(400).json({
          error: "A registration request with this email has already been approved",
        })
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create registration request (not a user yet)
    const registrationRequest = new RegistrationRequest({
      name,
      email,
      password: hashedPassword, // Store as hashed text
      department,
      position,
      phone,
      address,
      role: role || "employee",
      adminCode,
      status: "pending",
    })

    await registrationRequest.save()
    console.log("✅ Registration request created:", registrationRequest._id)

    // Create notification for admins
    const notification = new Notification({
      type: "registration_request",
      message: `New registration request from ${name} (${email}) is pending approval.`,
      link: "/registration-requests",
      recipientRoles: ["admin"],
      relatedId: registrationRequest._id,
      relatedModel: "RegistrationRequest",
    })
    await notification.save()
    console.log("✅ Notification created for new registration request")

    res.status(201).json({
      message: "Registration request submitted successfully! Please wait for admin approval before you can login.",
      requestId: registrationRequest._id,
      status: "pending",
      note: "You will be notified once your registration is approved by an administrator.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists in registration requests" })
    }
    res.status(500).json({ error: error.message })
  }
})

// Get all registration requests (Admin only)
router.get("/registration-requests", auth, adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status) {
      query.status = status
    }

    const requests = await RegistrationRequest.find(query)
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await RegistrationRequest.countDocuments(query)

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: Number.parseInt(page),
      total,
    })
  } catch (error) {
    console.error("Error fetching registration requests:", error)
    res.status(500).json({ error: error.message })
  }
})

// Approve registration request (Admin only)
router.post("/approve-registration/:requestId", auth, adminAuth, async (req, res) => {
  try {
    const { requestId } = req.params

    console.log("=== APPROVING REGISTRATION ===")
    console.log("Request ID:", requestId)
    console.log("Admin:", req.user.name)

    const registrationRequest = await RegistrationRequest.findById(requestId)
    if (!registrationRequest) {
      return res.status(404).json({ error: "Registration request not found" })
    }

    if (registrationRequest.status !== "pending") {
      return res.status(400).json({ error: "Registration request has already been processed" })
    }

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email: registrationRequest.email })
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Generate employee ID
    const employeeId = await generateEmployeeId()

    // Create the actual user
    const user = new User({
      employeeId,
      name: registrationRequest.name,
      email: registrationRequest.email,
      password: registrationRequest.password,
      department: registrationRequest.department,
      position: registrationRequest.position,
      phone: registrationRequest.phone,
      address: registrationRequest.address,
      role: registrationRequest.role,
      isActive: true,
    })

    await user.save()

    // Update registration request status
    registrationRequest.status = "approved"
    registrationRequest.reviewedAt = new Date()
    registrationRequest.reviewedBy = req.user._id
    await registrationRequest.save()

    console.log("✅ Registration approved and user created:", user.employeeId)

    res.json({
      message: "Registration approved successfully! User can now login.",
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
      },
    })
  } catch (error) {
    console.error("Error approving registration:", error)
    res.status(500).json({ error: error.message })
  }
})

// Reject registration request (Admin only)
router.post("/reject-registration/:requestId", auth, adminAuth, async (req, res) => {
  try {
    const { requestId } = req.params
    const { reason } = req.body

    console.log("=== REJECTING REGISTRATION ===")
    console.log("Request ID:", requestId)
    console.log("Admin:", req.user.name)
    console.log("Reason:", reason)

    const registrationRequest = await RegistrationRequest.findById(requestId)
    if (!registrationRequest) {
      return res.status(404).json({ error: "Registration request not found" })
    }

    if (registrationRequest.status !== "pending") {
      return res.status(400).json({ error: "Registration request has already been processed" })
    }

    // Update registration request status
    registrationRequest.status = "rejected"
    registrationRequest.reviewedAt = new Date()
    registrationRequest.reviewedBy = req.user._id
    registrationRequest.rejectionReason = reason || "No reason provided"
    await registrationRequest.save()

    console.log("✅ Registration rejected")

    res.json({
      message: "Registration request rejected successfully.",
      reason: registrationRequest.rejectionReason,
    })
  } catch (error) {
    console.error("Error rejecting registration:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get registration request statistics (Admin only)
router.get("/registration-stats", auth, adminAuth, async (req, res) => {
  try {
    const stats = await RegistrationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    }

    stats.forEach((stat) => {
      result[stat._id] = stat.count
      result.total += stat.count
    })

    res.json(result)
  } catch (error) {
    console.error("Error fetching registration stats:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Email:", email)

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user by email
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isActive: true, // Only allow active users to login
    })

    console.log("User found:", user ? "YES" : "NO")

    if (!user) {
      console.log("No active user found with email:", email)

      // Check if there's a pending registration request
      const pendingRequest = await RegistrationRequest.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        status: "pending",
      })

      if (pendingRequest) {
        return res.status(401).json({
          error: "Your registration is still pending admin approval. Please wait for approval before logging in.",
        })
      }

      const rejectedRequest = await RegistrationRequest.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        status: "rejected",
      })

      if (rejectedRequest) {
        return res.status(401).json({
          error: "Your registration request was rejected. Please contact the administrator.",
        })
      }

      return res.status(401).json({ error: "Invalid email or password, or account not found" })
    }

    console.log("User details:")
    console.log("- Name:", user.name)
    console.log("- Email:", user.email)
    console.log("- Role:", user.role)
    console.log("- Active:", user.isActive)

    // Check password (hashed comparison)
    const isMatch = await bcrypt.compare(password, user.password)

    console.log("Password comparison result:", isMatch)

    if (!isMatch) {
      console.log("❌ Password comparison failed")
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful!")

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        phone: user.phone,
        address: user.address,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.post("/forgot-password", async (req, res) => {
  try {
    console.log("=== FORGOT PASSWORD REQUEST START ===")

    const { email } = req.body

    if (!email) {
      console.log("❌ No email provided")
      return res.status(400).json({ error: "Email is required" })
    }

    console.log("Email:", email)
    console.log("Environment variables check:")
    console.log("- EMAIL_USER:", process.env.EMAIL_USER || "NOT SET")
    console.log("- EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET")
    console.log("- FRONTEND_URL:", process.env.FRONTEND_URL || "NOT SET")

    // Check if user exists and is active
    console.log("Searching for user...")
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isActive: true,
    })

    if (!user) {
      console.log("❌ No user found with email:", email)
      return res.status(404).json({
        error: "Sorry, no user exists with this email address. Please check the email and try again.",
      })
    }

    console.log("✅ User found:", user.name, "(" + user.email + ")")

    // Check if email is configured - REQUIRED for security
    const emailConfigured =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_USER.trim() !== "" &&
      process.env.EMAIL_PASS.trim() !== ""

    console.log("Email configured:", emailConfigured)

    if (!emailConfigured) {
      console.log("❌ Email not configured - cannot send reset email")
      return res.status(500).json({
        error: "Email service is not configured. Please contact your system administrator.",
        adminNote: "Configure EMAIL_USER and EMAIL_PASS environment variables with Gmail App Password",
      })
    }

    // Generate reset token
    console.log("Generating reset token...")
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    console.log("Reset token generated:", resetToken.substring(0, 10) + "...")

    // Save reset token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpiry = resetTokenExpiry
    await user.save()
    console.log("✅ Reset token saved to database")

    // Create email transporter with better configuration
    console.log("Creating email transporter...")
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be the App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    console.log("Transporter created, verifying connection...")

    // Test the connection first
    try {
      await transporter.verify()
      console.log("✅ Email server connection verified")
    } catch (verifyError) {
      console.error("❌ Email server verification failed:", verifyError.message)

      // Clear the reset token since we can't send email
      user.resetPasswordToken = undefined
      user.resetPasswordExpiry = undefined
      await user.save()

      // Provide specific error messages for common issues
      let errorMessage = "Email service configuration error. Please contact your administrator."

      if (verifyError.message.includes("Invalid login")) {
        errorMessage = "Email authentication failed. Please ensure Gmail App Password is correctly configured."
      } else if (verifyError.message.includes("Username and Password not accepted")) {
        errorMessage = "Gmail credentials rejected. Please verify the App Password is correct and 2FA is enabled."
      }

      return res.status(500).json({
        error: errorMessage,
        adminNote: "Check Gmail App Password configuration. Visit: https://myaccount.google.com/apppasswords",
        technicalDetails: verifyError.message,
      })
    }

    // Send the email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: {
        name: "Employee Attendance System",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset Request - Employee Attendance System",
      html: ``,
    }

    console.log("Sending email to:", email)
    await transporter.sendMail(mailOptions)
    console.log("✅ Email sent successfully")

    res.json({
      message:
        "If this email exists in our system, you will receive a password reset link shortly. Please check your inbox and spam folder.",
      success: true,
    })
  } catch (error) {
    console.error("❌ FORGOT PASSWORD ERROR:", error)
    console.error("Error stack:", error.stack)

    res.status(500).json({
      error: "Internal server error. Please try again later.",
      details: error.message,
    })
  }
})

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body

    console.log("=== PASSWORD RESET ATTEMPT ===")
    console.log("Token provided:", token ? "Yes" : "No")
    console.log("New password provided:", newPassword ? "Yes" : "No")

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
      isActive: true,
    })

    if (!user) {
      console.log("❌ Invalid or expired token")
      return res.status(400).json({
        error: "Invalid or expired reset token. Please request a new password reset.",
      })
    }

    console.log("✅ Valid token found for user:", user.email)

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedNewPassword = await bcrypt.hash(newPassword, salt)

    // Update password and clear reset token
    user.password = hashedNewPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    console.log(`✅ Password reset successful for user: ${user.email}`)

    res.json({
      message: "Password reset successful! You can now login with your new password.",
      success: true,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Internal server error. Please try again later." })
  }
})

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// NEW: Get notifications for the current user
router.get("/notifications", auth, async (req, res) => {
  try {
    const userRole = req.user.role
    const userId = req.user._id

    // Find notifications relevant to the user's role that they haven't read yet
    const notifications = await Notification.find({
      recipientRoles: userRole,
      readBy: { $ne: userId }, // Notifications not yet read by this user
    })
      .sort({ createdAt: -1 })
      .limit(20) // Limit to recent notifications

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: error.message })
  }
})

// NEW: Mark a notification as read for the current user
router.put("/notifications/:id/read", auth, async (req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.user._id

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" })
    }

    // Add user ID to readBy array if not already present
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId)
      await notification.save()
    }

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
