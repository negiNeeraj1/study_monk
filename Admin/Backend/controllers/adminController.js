const User = require("../models/User");
const StudyMaterial = require("../models/StudyMaterial");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Analytics = require("../models/Analytics");
const SystemLog = require("../models/SystemLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Connection health check
const checkDBHealth = async () => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    // Test with a simple ping
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if database is connected and healthy
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "Database not ready, connection state:",
        mongoose.connection.readyState
      );
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    // Perform health check
    const isHealthy = await checkDBHealth();
    if (!isHealthy) {
      console.error("Database health check failed");
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    // Find user by email with improved timeout and retry logic
    let user;
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        user = await Promise.race([
          User.findOne({ email }).select("+password").maxTimeMS(8000), // Reduced timeout to 8 seconds
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Database query timeout")), 8000)
          ),
        ]);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.warn(
          `Admin login attempt ${retryCount} failed:`,
          error.message
        );

        if (retryCount >= maxRetries) {
          throw new Error("Database query failed after multiple attempts");
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin or super_admin
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log successful login (optional - don't fail if logging fails)
    try {
      await SystemLog.create({
        level: "info",
        message: `Admin user ${user.email} logged in successfully`,
        module: "admin-auth",
        action: "login",
        userId: user._id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        metadata: {
          loginTime: new Date().toISOString(),
        },
      });
    } catch (logError) {
      console.warn("Failed to log admin login:", logError.message);
    }

    // Return success response
    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    // Handle specific error types
    if (
      error.message === "Database query timeout" ||
      error.message === "Database query failed after multiple attempts"
    ) {
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    if (
      error.name === "MongooseError" ||
      error.name === "MongoError" ||
      error.name === "MongoServerSelectionError"
    ) {
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Dashboard Overview
exports.getDashboardStats = async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Parallel queries for better performance with error handling
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalMaterials,
      totalQuizzes,
      completedQuizzes,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      User.countDocuments({
        updatedAt: { $gte: startOfWeek },
      }).catch(() => 0),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
      }).catch(() => 0),
      StudyMaterial.countDocuments().catch(() => 0),
      Quiz.countDocuments({ isPublished: true }).catch(() => 0),
      QuizAttempt.countDocuments({
        createdAt: { $gte: startOfMonth },
        isCompleted: true,
      }).catch(() => 0),
      SystemLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("level message module createdAt")
        .catch(() => []),
    ]);

    // Calculate growth rates
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: startOfMonth },
    }).catch(() => 0);

    const userGrowthRate =
      usersLastMonth > 0
        ? (
            ((newUsersThisMonth - usersLastMonth) / usersLastMonth) *
            100
          ).toFixed(1)
        : 100;

    // Average quiz score
    let averageScore = 0;
    try {
      const avgScoreResult = await QuizAttempt.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]);
      averageScore =
        avgScoreResult.length > 0 && avgScoreResult[0].avgScore !== null
          ? avgScoreResult[0].avgScore.toFixed(1)
          : 0;
    } catch (error) {
      console.warn("Failed to calculate average score:", error.message);
      averageScore = 0;
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsersThisMonth,
          growthRate: parseFloat(userGrowthRate),
        },
        content: {
          materials: totalMaterials,
          quizzes: totalQuizzes,
          completedQuizzes: completedQuizzes,
        },
        performance: {
          averageScore: parseFloat(averageScore),
          activeUsers: activeUsers,
          engagementRate:
            totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Analytics data for charts
exports.getAnalyticsData = async (req, res) => {
  try {
    const { period = "7d", type = "overview" } = req.query;

    let dateFilter;
    const now = new Date();

    switch (period) {
      case "24h":
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    if (type === "users") {
      // User analytics
      const userStats = await User.aggregate([
        {
          $match: { createdAt: { $gte: dateFilter } },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      res.json({
        success: true,
        data: {
          userGrowth: userStats.map((stat) => ({
            date: stat._id.date,
            users: stat.newUsers,
          })),
        },
      });
    } else if (type === "quiz") {
      // Quiz performance analytics
      const quizStats = await QuizAttempt.aggregate([
        {
          $match: { createdAt: { $gte: dateFilter } },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
            attempts: { $sum: 1 },
            avgScore: { $avg: "$score" },
            passRate: {
              $avg: { $cond: [{ $eq: ["$passed", true] }, 1, 0] },
            },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      res.json({
        success: true,
        data: {
          quizPerformance: quizStats.map((stat) => ({
            date: stat._id.date,
            attempts: stat.attempts,
            averageScore: Math.round(stat.avgScore),
            passRate: Math.round(stat.passRate * 100),
          })),
        },
      });
    } else {
      // Overview analytics
      const [userGrowth, materialUsage, quizActivity] = await Promise.all([
        User.aggregate([
          {
            $match: { createdAt: { $gte: dateFilter } },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.date": 1 } },
        ]),
        StudyMaterial.aggregate([
          {
            $match: { uploadDate: { $gte: dateFilter } },
          },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              downloads: { $sum: "$downloadCount" },
            },
          },
        ]),
        QuizAttempt.aggregate([
          {
            $match: { createdAt: { $gte: dateFilter } },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
              attempts: { $sum: 1 },
            },
          },
          { $sort: { "_id.date": 1 } },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          userGrowth: userGrowth.map((item) => ({
            date: item._id.date,
            users: item.count,
          })),
          materialsByCategory: materialUsage.map((item) => ({
            category: item._id,
            materials: item.count,
            downloads: item.downloads,
          })),
          quizActivity: quizActivity.map((item) => ({
            date: item._id.date,
            attempts: item.attempts,
          })),
        },
      });
    }
  } catch (error) {
    console.error("Analytics data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
};

// System health check
exports.getSystemHealth = async (req, res) => {
  try {
    const [dbStats, recentErrors, memoryUsage] = await Promise.all([
      // Database stats
      User.db.db.stats(),
      // Recent errors
      SystemLog.find({ level: "error" }).sort({ createdAt: -1 }).limit(5),
      // Memory usage (if available)
      Promise.resolve(process.memoryUsage()),
    ]);

    res.json({
      success: true,
      data: {
        database: {
          status: "connected",
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
        },
        server: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          },
          nodeVersion: process.version,
        },
        recentErrors: recentErrors.map((error) => ({
          message: error.message,
          module: error.module,
          timestamp: error.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("System health error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system health data",
    });
  }
};
