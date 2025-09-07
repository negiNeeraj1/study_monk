const express = require("express");
const router = express.Router();

// Controllers
const notificationController = require("../controllers/notificationController");

// Middleware
const {
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");

// Import user auth middleware
const { userAuth } = require("../middleware/userAuth");

// Apply authentication to all routes
router.use(userAuth);

// User-specific notification routes (no admin auth required)
// Get user's notifications
router.get("/", notificationController.getUserNotifications);

// Mark notification as read for user
router.patch(
  "/:id/read",
  validateObjectId("id"),
  handleValidationErrors,
  notificationController.markAsRead
);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;
