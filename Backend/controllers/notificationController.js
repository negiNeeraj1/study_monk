const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * 🔔 NOTIFICATION CONTROLLER
 * Handles all notification-related operations with proper error handling
 */

// ===== USER NOTIFICATION FUNCTIONS =====

/**
 * Get user's notifications with pagination and filtering
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unreadOnly = "false", type } = req.query;

    // Build query for user's notifications
    const now = new Date();
    let query = {
      isActive: true,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
      $or: [
        { recipients: "all" },
        {
          recipients: "students",
          $and: [
            {
              /* user role check */
            },
          ],
        },
        { recipients: "specific", specificUsers: userId },
      ],
    };

    // Get user role for filtering
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }
    if (user.role === "user") {
      query.$or[1].recipients = "students";
    } else {
      query.$or[1] = { recipients: "admins" };
    }

    // Filter by type if specified
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter for unread only if requested
    if (unreadOnly === "true") {
      query["readBy.user"] = { $ne: userId };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    // Add isRead flag for current user
    const notificationsWithReadStatus = notifications.map((notification) => {
      const isRead = Array.isArray(notification.readBy)
        ? notification.readBy.some((read) => read.user.toString() === userId)
        : false;
      return {
        ...notification.toObject(),
        isRead,
      };
    });

    res.json({
      success: true,
      data: {
        notifications: notificationsWithReadStatus,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalNotifications / parseInt(limit)),
          count: totalNotifications,
          limit: parseInt(limit),
          hasNext:
            parseInt(page) < Math.ceil(totalNotifications / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      },
      message: `Found ${totalNotifications} notifications`,
    });
  } catch (error) {
    console.error("🚨 Get user notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
      code: "NOTIFICATION_FETCH_ERROR",
    });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    // Check if already marked as read
    const alreadyRead = notification.readBy.some(
      (read) => read.user.toString() === userId
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: userId,
        readAt: new Date(),
      });

      // Update read count
      notification.deliveryStats.read = notification.readBy.length;
      await notification.save();
    }

    res.json({
      success: true,
      message: "Notification marked as read successfully",
    });
  } catch (error) {
    console.error("🚨 Mark as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
      code: "MARK_READ_ERROR",
    });
  }
};

/**
 * Get unread notification count for user
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    let query = {
      isActive: true,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
      $or: [
        { recipients: "all" },
        {
          recipients: "students",
          $and: [
            {
              /* user role check */
            },
          ],
        },
        { recipients: "specific", specificUsers: userId },
      ],
      "readBy.user": { $ne: userId },
    };

    // Get user role for filtering
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }
    if (user.role === "user") {
      query.$or[1].recipients = "students";
    } else {
      query.$or[1] = { recipients: "admins" };
    }

    const count = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: { count },
      message: `You have ${count} unread notifications`,
    });
  } catch (error) {
    console.error("🚨 Get unread count error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread count",
      code: "UNREAD_COUNT_ERROR",
    });
  }
};

/**
 * Mark all notifications as read for user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    let query = {
      isActive: true,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
      $or: [
        { recipients: "all" },
        {
          recipients: "students",
          $and: [
            {
              /* user role check */
            },
          ],
        },
        { recipients: "specific", specificUsers: userId },
      ],
      "readBy.user": { $ne: userId },
    };

    // Get user role for filtering
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }
    if (user.role === "user") {
      query.$or[1].recipients = "students";
    } else {
      query.$or[1] = { recipients: "admins" };
    }

    // Find all unread notifications
    const notifications = await Notification.find(query);

    // Mark each as read
    for (const notification of notifications) {
      notification.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      notification.deliveryStats.read = notification.readBy.length;
      await notification.save();
    }

    res.json({
      success: true,
      message: `Marked ${notifications.length} notifications as read`,
      data: { markedCount: notifications.length },
    });
  } catch (error) {
    console.error("🚨 Mark all as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark all notifications as read",
      code: "MARK_ALL_READ_ERROR",
    });
  }
};

// ===== ADMIN NOTIFICATION FUNCTIONS =====

/**
 * Get all notifications (admin only)
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      recipients,
      active,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (recipients && recipients !== "all") {
      query.recipients = recipients;
    }

    if (active !== "") {
      query.isActive = active === "true";
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(query)
        .populate("createdBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalNotifications / parseInt(limit)),
          count: totalNotifications,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("🚨 Get all notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
      code: "ADMIN_FETCH_ERROR",
    });
  }
};

/**
 * Create new notification (admin only)
 */
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "info",
      priority = "normal",
      recipients = "all",
      specificUsers = [],
      scheduledFor,
      expiresAt,
      actionButton,
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      recipients,
      specificUsers: recipients === "specific" ? specificUsers : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      actionButton,
      createdBy: req.user.id,
    });

    // Calculate delivery stats based on recipients
    let targetUserCount = 0;
    if (recipients === "all") {
      targetUserCount = await User.countDocuments();
    } else if (recipients === "students") {
      targetUserCount = await User.countDocuments({ role: "user" });
    } else if (recipients === "admins") {
      targetUserCount = await User.countDocuments({ role: "admin" });
    } else if (recipients === "specific") {
      targetUserCount = specificUsers.length;
    }

    // Update delivery stats
    notification.deliveryStats.sent = targetUserCount;
    notification.deliveryStats.delivered = targetUserCount;
    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("🚨 Create notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create notification",
      code: "CREATE_NOTIFICATION_ERROR",
    });
  }
};

/**
 * Get notification by ID (admin only)
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id)
      .populate("createdBy", "name email")
      .populate("specificUsers", "name email")
      .populate("readBy.user", "name email");

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("🚨 Get notification by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification",
      code: "FETCH_NOTIFICATION_ERROR",
    });
  }
};

/**
 * Update notification (admin only)
 */
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if notification exists
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.json({
      success: true,
      data: updatedNotification,
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("🚨 Update notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update notification",
      code: "UPDATE_NOTIFICATION_ERROR",
    });
  }
};

/**
 * Delete notification (admin only)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Notification deleted successfully",
      data: { deletedId: id, title: notification.title },
    });
  } catch (error) {
    console.error("🚨 Delete notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete notification",
      code: "DELETE_NOTIFICATION_ERROR",
    });
  }
};

/**
 * Get notification analytics (admin only)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let dateFilter;
    const now = new Date();

    switch (period) {
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
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalNotifications,
      activeNotifications,
      notificationsByType,
      deliveryStats,
      engagementStats,
    ] = await Promise.all([
      Notification.countDocuments({ createdAt: { $gte: dateFilter } }),
      Notification.countDocuments({
        createdAt: { $gte: dateFilter },
        isActive: true,
      }),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: "$deliveryStats.sent" },
            totalDelivered: { $sum: "$deliveryStats.delivered" },
            totalRead: { $sum: "$deliveryStats.read" },
          },
        },
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $addFields: {
            readRate: {
              $cond: [
                { $eq: ["$deliveryStats.delivered", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$deliveryStats.read",
                        "$deliveryStats.delivered",
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$type",
            avgReadRate: { $avg: "$readRate" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const delivery = deliveryStats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
    };

    const deliveryRate =
      delivery.totalSent > 0
        ? Math.round((delivery.totalDelivered / delivery.totalSent) * 100)
        : 0;

    const readRate =
      delivery.totalDelivered > 0
        ? Math.round((delivery.totalRead / delivery.totalDelivered) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total: totalNotifications,
          active: activeNotifications,
          deliveryRate,
          readRate,
        },
        byType: notificationsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        engagement: engagementStats.map((stat) => ({
          type: stat._id,
          averageReadRate: Math.round(stat.avgReadRate || 0),
          count: stat.count,
        })),
        deliveryStats: delivery,
      },
    });
  } catch (error) {
    console.error("🚨 Get analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      code: "ANALYTICS_ERROR",
    });
  }
};

/**
 * Sync notification from admin backend (internal use)
 */
exports.syncNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "info",
      priority = "normal",
      recipients = "all",
      specificUsers = [],
      scheduledFor,
      expiresAt,
      actionButton,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Create notification in main backend
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      recipients,
      specificUsers: recipients === "specific" ? specificUsers : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      actionButton,
      createdBy: createdBy || "system",
      deliveryStats: {
        sent: 0,
        delivered: 0,
        read: 0,
      },
    });

    // Calculate delivery stats based on recipients
    let targetUserCount = 0;
    if (recipients === "all") {
      targetUserCount = await User.countDocuments();
    } else if (recipients === "students") {
      targetUserCount = await User.countDocuments({ role: "user" });
    } else if (recipients === "admins") {
      targetUserCount = await User.countDocuments({ role: "admin" });
    } else if (recipients === "specific") {
      targetUserCount = specificUsers.length;
    }

    // Update delivery stats
    notification.deliveryStats.sent = targetUserCount;
    notification.deliveryStats.delivered = targetUserCount;
    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification synced successfully",
    });
  } catch (error) {
    console.error("🚨 Sync notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync notification",
      code: "SYNC_NOTIFICATION_ERROR",
    });
  }
};
