require("dotenv").config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_for_study_ai_app_2024";
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/study-ai";
}

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");

// Import configurations and middleware
const connectDB = require("./config/database");
const {
  securityHeaders,
  adminCors,
  requestLogger,
  securityErrorHandler,
} = require("./middleware/security");

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quizRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userNotificationRoutes = require("./routes/userNotificationRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");

// Comment out cross-dependencies for standalone deployment
// const aiRoutes = require("../../Backend/routes/aiRoutes");
// const studyMaterialRoutes = require("../../Backend/routes/studyMaterialRoutes");

// Import new admin study material routes
const adminStudyMaterialRoutes = require("./routes/studyMaterialRoutes");
const publicStudyMaterialRoutes = require("./routes/publicStudyMaterialRoutes");

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set("trust proxy", 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors(adminCors));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Custom request logging
app.use(requestLogger);

// Health check route (public)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Admin backend server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database health check route (public)
app.get("/api/health/db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.status(200).json({
      status: "ok",
      message: "Database health check",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatusText[dbStatus] || "unknown",
        readyState: dbStatus,
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes

// Import admin auth routes
const adminAuthRoutes = require("./routes/adminAuthRoutes");

// Authentication Routes (for both admin and user)
app.use("/api/auth", adminAuthRoutes);

// Admin Panel Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/quizzes", quizRoutes);
app.use("/api/admin/study-materials", adminStudyMaterialRoutes);
app.use("/api/notifications/admin", notificationRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

// User Notification Routes (no admin auth required)
app.use("/api/notifications/user", userNotificationRoutes);

// Public Study Material Routes (for user access)
app.use("/api/study-materials", publicStudyMaterialRoutes);

// Comment out cross-dependency routes for standalone deployment
// app.use("/api/ai", aiRoutes);

// API documentation route
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    message: "Admin Panel API Documentation",
    version: "1.0.0",
    endpoints: {
      admin: {
        dashboard: "GET /api/admin/dashboard/stats",
        analytics: "GET /api/admin/analytics",
        systemHealth: "GET /api/admin/system/health",
      },
      users: {
        list: "GET /api/admin/users",
        stats: "GET /api/admin/users/stats",
        getById: "GET /api/admin/users/:id",
        create: "POST /api/admin/users",
        update: "PUT /api/admin/users/:id",
        delete: "DELETE /api/admin/users/:id",
      },
      quizzes: {
        list: "GET /api/admin/quizzes",
        stats: "GET /api/admin/quizzes/stats",
        attempts: "GET /api/admin/quizzes/attempts",
        getById: "GET /api/admin/quizzes/:id",
        create: "POST /api/admin/quizzes",
        update: "PUT /api/admin/quizzes/:id",
        togglePublication: "PATCH /api/admin/quizzes/:id/toggle-publication",
        delete: "DELETE /api/admin/quizzes/:id",
      },
      notifications: {
        admin: {
          list: "GET /api/notifications/admin",
          analytics: "GET /api/notifications/admin/analytics",
          getById: "GET /api/notifications/admin/:id",
          create: "POST /api/notifications/admin",
          update: "PUT /api/notifications/admin/:id",
          delete: "DELETE /api/notifications/admin/:id",
        },
        user: {
          list: "GET /api/notifications/user",
          markRead: "PATCH /api/notifications/:id/read",
        },
      },
      auth: {
        login: "POST /api/auth/login",
        signup: "POST /api/auth/signup",
      },
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <token>",
      adminRequired: "Most endpoints require admin role",
    },
  });
});

// Serve uploaded study materials statically
const uploadsDir = path.join(__dirname, "./uploads");
app.use("/uploads", express.static(uploadsDir));

// Catch-all route for undefined endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    availableEndpoints: "/api/docs",
  });
});

// Security error handling
app.use(securityErrorHandler);

// Global error handling middleware
app.use(async (err, req, res, next) => {
  console.error("Global error handler:", err);

  // Only try to log if database is connected
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      const SystemLog = require("./models/SystemLog");
      await SystemLog.create({
        level: "error",
        message: err.message || "Unknown error occurred",
        module: "server",
        action: "global-error",
        userId: req.user?.id || null,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        metadata: {
          route: req.path,
          method: req.method,
          error: err.stack,
        },
      });
    }
  } catch (logError) {
    console.error("Failed to log error to database:", logError);
  }

  // Send error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server only after database connection
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log("✅ Database connection ready");

    // Start server
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Admin Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`💓 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Server bound to: 0.0.0.0:${PORT}`);

      // Log server start only after successful connection
      try {
        const SystemLog = require("./models/SystemLog");
        SystemLog.create({
          level: "info",
          message: "Admin backend server started successfully",
          module: "server",
          action: "startup",
          metadata: {
            port: PORT,
            environment: process.env.NODE_ENV || "development",
            timestamp: new Date().toISOString(),
          },
        })
          .then(() => {
            console.log("✅ Server start logged to database");
          })
          .catch((logError) => {
            console.warn("⚠️ Failed to log server start:", logError.message);
          });
      } catch (logError) {
        console.warn("⚠️ SystemLog model not available:", logError.message);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
