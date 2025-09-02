const express = require("express");
const router = express.Router();

// Controllers
const notificationController = require("../controllers/notificationController");

// Middleware
const { adminAuth } = require("../middleware/adminAuth");
const {
  validateNotification,
  validatePagination,
  validateDateRange,
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

// Notification Management Routes

// Get all notifications with pagination and filters
router.get(
  "/",
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  notificationController.getNotifications
);

// Get notification analytics
router.get(
  "/analytics",
  validateDateRange,
  handleValidationErrors,
  notificationController.getNotificationAnalytics
);

// Get notification by ID
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  notificationController.getNotificationById
);

// Create new notification
router.post(
  "/",
  sensitiveOperationsLimit,
  validateNotification,
  handleValidationErrors,
  notificationController.createNotification
);

// Update notification
router.put(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  validateNotification,
  handleValidationErrors,
  notificationController.updateNotification
);

// Delete notification
router.delete(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  notificationController.deleteNotification
);

module.exports = router;
