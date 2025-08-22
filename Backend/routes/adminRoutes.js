const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authImproved");
const adminController = require("../controllers/adminController");

/**
 * 👑 ADMIN ROUTES
 * All routes require admin authentication
 */

// Apply admin authentication to all routes
router.use(requireAdmin);

// Dashboard Routes
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalyticsData);

// System Health Route (requires auth)
router.get("/system/health", adminController.getSystemHealth);

// User Statistics
router.get("/users/stats", adminController.getUserStats);

// User Management
router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUserById);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
