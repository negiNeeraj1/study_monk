const dotenv = require("dotenv");
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_for_study_ai_app_2024";
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/study-ai";
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const { applySecurityMiddleware } = require("./middleware/security");
const { hasAtLeastRole, hasPermission } = require("./middleware/rbac");
const { auth, adminAuth, instructorOrAdminAuth } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";

    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: "majority",
    };

    await mongoose.connect(mongoUri, connectionOptions);
    console.log("MongoDB connected successfully");

    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    db.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);

    if (process.env.NODE_ENV === "production") {
      setTimeout(connectDB, 10000);
    } else {
      process.exit(1);
    }
  }
};

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

applySecurityMiddleware(app);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "AI-PSM Study Material System is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.status(200).json({
      success: true,
      database: {
        status: statusMap[dbStatus] || "unknown",
        readyState: dbStatus,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database health check failed",
      details: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", auth, aiRoutes);
app.use("/api/study-materials", auth, studyMaterialRoutes);
app.use("/api/notifications", auth, notificationRoutes);
app.use("/api/admin", adminAuth, adminRoutes);
app.use("/api/quiz-attempts", auth, quizAttemptRoutes);
app.use("*", notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, HOST, () => {
      console.log(`Server running at: http://${HOST}:${PORT}`);
      console.log(`API Base URL: http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();
