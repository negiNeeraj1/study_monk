const express = require("express");
const router = express.Router();

// Controllers
const userController = require("../controllers/userController");

// Middleware
const { adminAuth } = require("../middleware/adminAuth");
const {
  validateUser,
  validatePagination,
  validateDateRange,
  validateSearch,
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");
const {
  adminRateLimit,
  sensitiveOperationsLimit,
} = require("../middleware/security");

// Apply admin authentication and rate limiting to all routes
router.use(adminAuth);
router.use(adminRateLimit);

// User Management Routes

// Health check for user routes
router.get("/health", async (req, res) => {
  try {
    // Check database connection status
    const mongoose = require("mongoose");
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Simple database connection test
    const User = require("../models/User");
    const count = await User.countDocuments().maxTimeMS(5000);

    res.json({
      success: true,
      message: "User routes are healthy",
      database: {
        status: dbStatusText[dbStatus] || "unknown",
        readyState: dbStatus,
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
      },
      userCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User routes health check failed",
      error: error.message,
      database: {
        status: "error",
        readyState: mongoose?.connection?.readyState || "unknown",
      },
    });
  }
});

// Get all users with pagination and filters
router.get(
  "/",
  validatePagination,
  validateDateRange,
  validateSearch,
  handleValidationErrors,
  userController.getUsers
);

// Get user statistics
router.get("/stats", userController.getUserStats);

// Get user by ID
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  userController.getUserById
);

// Create new user
router.post(
  "/",
  sensitiveOperationsLimit,
  validateUser,
  handleValidationErrors,
  userController.createUser
);

// Update user
router.put(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  validateUser,
  handleValidationErrors,
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  userController.deleteUser
);

module.exports = router;
