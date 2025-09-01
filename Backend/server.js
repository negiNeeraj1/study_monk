const dotenv = require("dotenv");
dotenv.config();

// Set default environment variables if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_for_study_ai_app_2024";
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/study-ai";
}

console.log("🔧 Environment Configuration:");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
console.log("- PORT:", process.env.PORT || 5000);
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "FOUND" : "NOT FOUND");
console.log("- GOOGLE_AI_API_KEY:", process.env.GOOGLE_AI_API_KEY ? "FOUND" : "NOT FOUND");

const express = require("express");
const app = express();
const mongoose = require("mongoose");

// Import security middleware
const { applySecurityMiddleware } = require("./middleware/security");

// Import RBAC middleware
const { hasAtLeastRole, hasPermission } = require("./middleware/rbac");

// Import authentication middleware
const { auth, adminAuth, instructorOrAdminAuth } = require("./middleware/auth");

// Import error handling middleware
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");

// Database connection function
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/study-ai";

    console.log("🔌 Attempting to connect to MongoDB...");
    console.log("📍 Connection string:", mongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));

    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Maximum time a connection can be idle
      retryWrites: true,
      w: "majority"
    };

    await mongoose.connect(mongoUri, connectionOptions);
    console.log("✅ MongoDB connected successfully!");

    // Test the connection
    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    db.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("🛑 Received SIGINT, closing MongoDB connection...");
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("🛑 Received SIGTERM, closing MongoDB connection...");
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("🔍 Error details:", err);

    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Retrying connection in 10 seconds...");
      setTimeout(connectDB, 10000);
    } else {
      console.error("💥 Exiting due to database connection failure");
      process.exit(1);
    }
  }
};

// Initialize Express app
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

// Apply security middleware
applySecurityMiddleware(app);

// Health check route (public)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "AI-PSM Study Material System is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

// Database health check route (public)
app.get("/api/health/db", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    res.status(200).json({
      success: true,
      database: {
        status: statusMap[dbStatus] || "unknown",
        readyState: dbStatus,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database health check failed",
      details: error.message
    });
  }
});

// API Routes with RBAC protection
app.use("/api/auth", authRoutes);

// AI routes - require authentication
app.use("/api/ai", auth, aiRoutes);

// Study material routes with role-based access
app.use("/api/study-materials", auth, studyMaterialRoutes);

// Notification routes - require authentication
app.use("/api/notifications", auth, notificationRoutes);

// Admin routes - require admin privileges
app.use("/api/admin", adminAuth, adminRoutes);

// Quiz attempt routes - require authentication
app.use("/api/quiz-attempts", auth, quizAttemptRoutes);

// 404 handler for undefined routes
app.use("*", notFound);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start listening
    app.listen(PORT, HOST, () => {
      console.log("🚀 Server started successfully!");
      console.log(`📍 Server running at: http://${HOST}:${PORT}`);
      console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
      console.log(`🏥 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`💾 Database Status: http://${HOST}:${PORT}/api/health/db`);
      console.log("⏰ Started at:", new Date().toISOString());
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  console.error("Stack trace:", err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();
