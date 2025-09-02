const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const StudyMaterial = require("../models/StudyMaterial");
const SystemLog = require("../models/SystemLog");

// Get all users with pagination and filters
exports.getUsers = async (req, res) => {
  try {
    // Check database connection first
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection not ready. Please try again.",
      });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination and timeout protection
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Add timeout to database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Database operation timed out")),
        15000
      );
    });

    console.log("🔍 Executing user query with filters:", {
      query,
      skip,
      limit,
      sortOptions,
    });

    const [users, totalUsers] = await Promise.race([
      Promise.all([
        User.find(query)
          .select("-password")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean()
          .maxTimeMS(10000), // MongoDB operation timeout
        User.countDocuments(query).maxTimeMS(10000),
      ]),
      timeoutPromise,
    ]);

    console.log(`✅ Found ${users.length} users out of ${totalUsers} total`);

    // Add additional stats for each user with timeout protection
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const [quizAttempts, materialsUploaded] = await Promise.race([
            Promise.all([
              QuizAttempt.countDocuments({ user: user._id }).maxTimeMS(5000),
              StudyMaterial.countDocuments({ user: user._id }).maxTimeMS(5000),
            ]),
            timeoutPromise,
          ]);

          return {
            ...user,
            stats: {
              quizAttempts,
              materialsUploaded,
              lastActive: user.updatedAt,
            },
          };
        } catch (error) {
          console.warn(
            `Failed to get stats for user ${user._id}:`,
            error.message
          );
          return {
            ...user,
            stats: {
              quizAttempts: 0,
              materialsUploaded: 0,
              lastActive: user.updatedAt,
            },
          };
        }
      })
    );

    console.log("✅ Successfully processed user stats");

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalUsers / parseInt(limit)),
          count: totalUsers,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    // Provide more specific error messages
    if (error.message.includes("timed out")) {
      return res.status(504).json({
        success: false,
        message: "Request timed out. Please try again.",
      });
    }

    if (error.message.includes("buffering timed out")) {
      return res.status(503).json({
        success: false,
        message: "Database connection issue. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user by ID with detailed stats
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user statistics
    const [quizAttempts, materialsUploaded, recentActivity, quizPerformance] =
      await Promise.all([
        QuizAttempt.find({ user: id })
          .populate("quiz", "title category")
          .sort({ createdAt: -1 })
          .limit(10),
        StudyMaterial.find({ user: id }).sort({ uploadDate: -1 }).limit(10),
        SystemLog.find({ userId: id })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("action module createdAt"),
        QuizAttempt.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: "$score" },
              passedQuizzes: {
                $sum: { $cond: [{ $eq: ["$passed", true] }, 1, 0] },
              },
              totalTime: { $sum: "$timeTaken" },
            },
          },
        ]),
      ]);

    const performanceStats = quizPerformance[0] || {
      totalAttempts: 0,
      averageScore: 0,
      passedQuizzes: 0,
      totalTime: 0,
    };

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          stats: {
            quizAttempts: performanceStats.totalAttempts,
            averageScore: Math.round(performanceStats.averageScore || 0),
            passRate:
              performanceStats.totalAttempts > 0
                ? Math.round(
                    (performanceStats.passedQuizzes /
                      performanceStats.totalAttempts) *
                      100
                  )
                : 0,
            totalStudyTime: Math.round(performanceStats.totalTime || 0),
            materialsUploaded: materialsUploaded.length,
          },
        },
        recentQuizzes: quizAttempts,
        uploadedMaterials: materialsUploaded,
        recentActivity: recentActivity.map((log) => ({
          action: log.action,
          module: log.module,
          timestamp: log.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `User ${updatedUser.email} updated by admin`,
      module: "user-management",
      action: "update-user",
      userId: req.user.id,
      metadata: { targetUserId: id, changes: { name, email, role } },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of admin users (safety check)
    if (user.role === "admin" && user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own admin account",
      });
    }

    // Delete related data
    await Promise.all([
      QuizAttempt.deleteMany({ user: id }),
      StudyMaterial.deleteMany({ user: id }),
      SystemLog.deleteMany({ userId: id }),
    ]);

    // Delete user
    await User.findByIdAndDelete(id);

    // Log the action
    await SystemLog.create({
      level: "warn",
      message: `User ${user.email} deleted by admin`,
      module: "user-management",
      action: "delete-user",
      userId: req.user.id,
      metadata: { deletedUserId: id, deletedUserEmail: user.email },
    });

    res.json({
      success: true,
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `New user ${user.email} created by admin`,
      module: "user-management",
      action: "create-user",
      userId: req.user.id,
      metadata: { createdUserId: user._id, userRole: role },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      adminUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const stats = {
      total: totalUsers,
      admins: adminUsers,
      active: activeUsers,
      newToday: newUsersToday,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recent: recentUsers,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};
