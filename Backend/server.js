const dotenv = require("dotenv");
dotenv.config();

// Set default environment variables if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_for_study_ai_app_2024";
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/study-ai";
}

console.log(
  "Loaded GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "FOUND" : "NOT FOUND"
);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
const express = require("express");
const app = express();

app.use(express.json());
const cors = require("cors");

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Load environment variables

// Initialize Express app;

// Connect to MongoDB
connectDB();

// CORS configuration to allow both frontends
const corsOptions = {
  origin: [
    "http://localhost:3000", // Main frontend
    "http://localhost:3001", // Admin frontend
    "http://localhost:5173", // Vite dev server (if used)
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));

// No-cache middleware for admin routes (development only)
if (process.env.NODE_ENV === "development") {
  app.use("/api/admin*", (req, res, next) => {
    res.set({
      "Cache-Control":
        "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });
    next();
  });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "StudyAI Backend Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug JWT route
app.get("/api/debug/jwt", (req, res) => {
  const authHeader = req.headers.authorization;
  const jwt = require("jsonwebtoken");

  res.json({
    success: true,
    debug: {
      jwtSecret: process.env.JWT_SECRET
        ? "SET (length: " + process.env.JWT_SECRET.length + ")"
        : "NOT SET",
      authHeader: authHeader ? "PROVIDED" : "MISSING",
      token: authHeader ? authHeader.substring(0, 20) + "..." : "NO TOKEN",
      serverTime: new Date().toISOString(),
      // Try to decode token without verification to see structure
      tokenPayload: authHeader
        ? (() => {
            try {
              const token = authHeader.split(" ")[1];
              return jwt.decode(token); // Decode without verification
            } catch (e) {
              return "INVALID_FORMAT";
            }
          })()
        : "NO_TOKEN",
    },
  });
});

// 404 handler for undefined API routes
app.use("/api/*", notFound);

// Global error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
