const express = require("express");
const router = express.Router();
const { auth, optionalAuth, requireAdmin, userRateLimit } = require("../middleware/authImproved");
const notificationController = require("../controllers/notificationController");

/**
 * 🔔 NOTIFICATION ROUTES
 * Unified notification system with proper authentication
 */

// Apply rate limiting to all notification routes
router.use(userRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes

// ===== USER NOTIFICATION ROUTES =====

/**
 * GET /api/notifications/user
 * Get user's notifications (supports pagination and filtering)
 * Query params: page, limit, unreadOnly, type
 */
router.get("/user", auth, notificationController.getUserNotifications);

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch("/:id/read", auth, notificationController.markAsRead);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for the user
 */
router.get("/unread-count", auth, notificationController.getUnreadCount);

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the user
 */
router.patch("/mark-all-read", auth, notificationController.markAllAsRead);

// ===== ADMIN NOTIFICATION ROUTES =====

/**
 * GET /api/notifications/admin
 * Get all notifications (admin only)
 */
router.get("/admin", requireAdmin, notificationController.getAllNotifications);

/**
 * POST /api/notifications/admin
 * Create new notification (admin only)
 */
router.post("/admin", requireAdmin, notificationController.createNotification);

/**
 * GET /api/notifications/admin/:id
 * Get notification by ID (admin only)
 */
router.get("/admin/:id", requireAdmin, notificationController.getNotificationById);

/**
 * PUT /api/notifications/admin/:id
 * Update notification (admin only)
 */
router.put("/admin/:id", requireAdmin, notificationController.updateNotification);

/**
 * DELETE /api/notifications/admin/:id
 * Delete notification (admin only)
 */
router.delete("/admin/:id", requireAdmin, notificationController.deleteNotification);

/**
 * GET /api/notifications/admin/analytics
 * Get notification analytics (admin only)
 */
router.get("/admin/analytics", requireAdmin, notificationController.getAnalytics);

// ===== HEALTH CHECK ROUTE =====

/**
 * GET /api/notifications/health
 * Check notification service health
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Notification service is healthy",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
