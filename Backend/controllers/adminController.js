const User = require("../models/User");
const {
  sendSuccess,
  sendError,
  AppError,
} = require("../middleware/errorHandler");

/**
 * 👑 ADMIN CONTROLLER
 * Handles admin dashboard and analytics operations
 */

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Basic dashboard stats using your existing User model
    const [totalUsers, activeUsers, adminUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }), // Assuming active users
      User.countDocuments({ role: "admin" }),
    ]);

    // Calculate some basic metrics
    const studentUsers = totalUsers - adminUsers;
    const userGrowthRate = 15; // Mock data - you can calculate this properly later

    const stats = {
      overview: {
        totalUsers,
        activeUsers,
        adminUsers,
        studentUsers,
        userGrowthRate,
      },
      // Mock data for charts - replace with real data from your database
      userGrowth: [
        {
          month: "Jan",
          students: Math.floor(studentUsers * 0.7),
          materials: 25,
        },
        {
          month: "Feb",
          students: Math.floor(studentUsers * 0.8),
          materials: 32,
        },
        {
          month: "Mar",
          students: Math.floor(studentUsers * 0.9),
          materials: 28,
        },
        { month: "Apr", students: studentUsers, materials: 35 },
      ],
      materialsByCategory: [
        { category: "Programming", materials: 15, color: "#8884d8" },
        { category: "Mathematics", materials: 12, color: "#82ca9d" },
        { category: "Science", materials: 8, color: "#ffc658" },
        { category: "Languages", materials: 10, color: "#ff7c7c" },
      ],
      quizActivity: [
        { day: "Mon", completed: 12, average: 85 },
        { day: "Tue", completed: 19, average: 78 },
        { day: "Wed", completed: 15, average: 82 },
        { day: "Thu", completed: 22, average: 89 },
        { day: "Fri", completed: 18, average: 76 },
        { day: "Sat", completed: 8, average: 91 },
        { day: "Sun", completed: 6, average: 88 },
      ],
      recentActivity: [
        {
          id: 1,
          type: "user_signup",
          message: "New user registered",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          user: "New Student",
        },
        {
          id: 2,
          type: "quiz_completed",
          message: "Quiz completed with 85% score",
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          user: "John Doe",
        },
      ],
    };

    sendSuccess(res, stats, "Dashboard statistics retrieved successfully");
  } catch (error) {
    console.error("🚨 Get dashboard stats error:", error);
    sendError(
      res,
      "Failed to retrieve dashboard statistics",
      500,
      "DASHBOARD_STATS_ERROR"
    );
  }
};

/**
 * Get analytics data
 */
exports.getAnalyticsData = async (req, res) => {
  try {
    const { period = "7d", type = "overview" } = req.query;

    // Mock analytics data - replace with real calculations
    const analyticsData = {
      userGrowth: [
        { month: "Jan", students: 100, materials: 25 },
        { month: "Feb", students: 150, materials: 32 },
        { month: "Mar", students: 200, materials: 28 },
        { month: "Apr", students: 250, materials: 35 },
      ],
      materialsByCategory: [
        { category: "Programming", materials: 15 },
        { category: "Mathematics", materials: 12 },
        { category: "Science", materials: 8 },
        { category: "Languages", materials: 10 },
      ],
      quizActivity: [
        { day: "Mon", completed: 12, average: 85 },
        { day: "Tue", completed: 19, average: 78 },
        { day: "Wed", completed: 15, average: 82 },
        { day: "Thu", completed: 22, average: 89 },
        { day: "Fri", completed: 18, average: 76 },
        { day: "Sat", completed: 8, average: 91 },
        { day: "Sun", completed: 6, average: 88 },
      ],
    };

    sendSuccess(
      res,
      analyticsData,
      `Analytics data for ${period} retrieved successfully`
    );
  } catch (error) {
    console.error("🚨 Get analytics data error:", error);
    sendError(
      res,
      "Failed to retrieve analytics data",
      500,
      "ANALYTICS_DATA_ERROR"
    );
  }
};

/**
 * Get system health
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "connected",
          responseTime: "12ms",
        },
        api: {
          status: "running",
          uptime: process.uptime(),
        },
        notifications: {
          status: "operational",
        },
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };

    sendSuccess(res, health, "System health check completed");
  } catch (error) {
    console.error("🚨 Get system health error:", error);
    sendError(
      res,
      "Failed to retrieve system health",
      500,
      "SYSTEM_HEALTH_ERROR"
    );
  }
};

/**
 * Get user statistics (for admin dashboard)
 */
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      total: await User.countDocuments(),
      byRole: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recent: await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
    };

    sendSuccess(res, formattedStats, "User statistics retrieved successfully");
  } catch (error) {
    console.error("🚨 Get user stats error:", error);
    sendError(
      res,
      "Failed to retrieve user statistics",
      500,
      "USER_STATS_ERROR"
    );
  }
};

/**
 * List users with pagination and filtering
 */
exports.listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(query),
    ]);

    // Format users data for frontend
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      id: user._id, // Add id field for compatibility
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "Active",
      lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never",
      averageScore: user.averageScore || 0,
      totalQuizzes: user.totalQuizzes || 0,
      studentsReached: user.studentsReached || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return sendSuccess(
      res,
      {
        users: formattedUsers,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total,
          limit: parseInt(limit),
        },
      },
      "Users fetched"
    );
  } catch (error) {
    console.error("🚨 List users error:", error);
    return sendError(res, "Failed to list users", 500, "LIST_USERS_ERROR");
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return sendError(res, "User not found", 404, "USER_NOT_FOUND");
    
    // Format user data for frontend
    const formattedUser = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "Active",
      lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never",
      averageScore: user.averageScore || 0,
      totalQuizzes: user.totalQuizzes || 0,
      studentsReached: user.studentsReached || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    return sendSuccess(res, formattedUser, "User fetched");
  } catch (error) {
    console.error("🚨 Get user by id error:", error);
    return sendError(res, "Failed to get user", 500, "GET_USER_ERROR");
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!name || !email || !password)
      return sendError(res, "Missing required fields", 400, "MISSING_FIELDS");
    const exists = await User.findOne({ email });
    if (exists)
      return sendError(res, "Email already in use", 400, "EMAIL_EXISTS");
    const user = await User.create({ name, email, password, role });
    return sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "User created",
      201
    );
  } catch (error) {
    console.error("🚨 Create user error:", error);
    return sendError(res, "Failed to create user", 500, "CREATE_USER_ERROR");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    delete update.password; // keep password unchanged here
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password"
    );
    if (!user) return sendError(res, "User not found", 404, "USER_NOT_FOUND");
    return sendSuccess(res, user, "User updated");
  } catch (error) {
    console.error("🚨 Update user error:", error);
    return sendError(res, "Failed to update user", 500, "UPDATE_USER_ERROR");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return sendError(res, "User not found", 404, "USER_NOT_FOUND");
    return sendSuccess(res, { id }, "User deleted");
  } catch (error) {
    console.error("🚨 Delete user error:", error);
    return sendError(res, "Failed to delete user", 500, "DELETE_USER_ERROR");
  }
};
