const User = require("../models/User");

/**
 * 🔔 NOTIFICATION CONTROLLER
 * Handles all notification-related operations with proper error handling
 */

/**
 * Simple in-memory notification store for this example
 * In production, you should use a proper database model
 */
let notifications = [
  {
    _id: "1",
    title: "Welcome to StudyAI!",
    message: "Welcome to our platform! Start your learning journey today.",
    type: "info",
    priority: "normal",
    recipients: "all",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    createdBy: "system",
    readBy: [],
    deliveryStats: { sent: 1, delivered: 1, read: 0 }
  },
  {
    _id: "2",
    title: "New Quiz Available",
    message: "A new quiz on JavaScript fundamentals is now available!",
    type: "announcement",
    priority: "high",
    recipients: "students",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    createdBy: "system",
    readBy: [],
    deliveryStats: { sent: 1, delivered: 1, read: 0 }
  }
];

let notificationIdCounter = 3;

// ===== USER NOTIFICATION FUNCTIONS =====

/**
 * Get user's notifications with pagination and filtering
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      unreadOnly = 'false', 
      type 
    } = req.query;

    // Filter notifications for this user
    let userNotifications = notifications.filter(notification => {
      // Check if notification is active
      if (!notification.isActive) return false;
      
      // Check if notification targets this user
      if (notification.recipients === 'all') return true;
      if (notification.recipients === 'students' && req.user.role === 'user') return true;
      if (notification.recipients === 'admins' && req.user.role === 'admin') return true;
      if (notification.recipients === 'specific' && 
          notification.specificUsers && 
          notification.specificUsers.includes(userId)) return true;
      
      return false;
    });

    // Filter by type if specified
    if (type && type !== 'all') {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    // Filter unread only if requested
    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(notification => 
        !notification.readBy.some(read => read.user === userId)
      );
    }

    // Add isRead flag for each notification
    const notificationsWithReadStatus = userNotifications.map(notification => ({
      ...notification,
      isRead: notification.readBy.some(read => read.user === userId)
    }));

    // Sort by creation date (newest first)
    notificationsWithReadStatus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notificationsWithReadStatus.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalNotifications = notificationsWithReadStatus.length;
    const totalPages = Math.ceil(totalNotifications / parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          count: totalNotifications,
          limit: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      message: `Found ${totalNotifications} notifications`
    });

  } catch (error) {
    console.error("🚨 Get user notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
      code: "NOTIFICATION_FETCH_ERROR"
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

    // Find the notification
    const notification = notifications.find(n => n._id === id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND"
      });
    }

    // Check if already marked as read
    const alreadyRead = notification.readBy.some(read => read.user === userId);
    
    if (alreadyRead) {
      return res.json({
        success: true,
        message: "Notification was already marked as read"
      });
    }

    // Mark as read
    notification.readBy.push({
      user: userId,
      readAt: new Date()
    });

    // Update read count
    notification.deliveryStats.read = notification.readBy.length;

    res.json({
      success: true,
      message: "Notification marked as read successfully"
    });

  } catch (error) {
    console.error("🚨 Mark as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
      code: "MARK_READ_ERROR"
    });
  }
};

/**
 * Get unread notification count for user
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Filter notifications for this user that are unread
    const unreadCount = notifications.filter(notification => {
      // Check if notification is active and targets this user
      if (!notification.isActive) return false;
      
      let targetsUser = false;
      if (notification.recipients === 'all') targetsUser = true;
      if (notification.recipients === 'students' && req.user.role === 'user') targetsUser = true;
      if (notification.recipients === 'admins' && req.user.role === 'admin') targetsUser = true;
      if (notification.recipients === 'specific' && 
          notification.specificUsers && 
          notification.specificUsers.includes(userId)) targetsUser = true;
      
      if (!targetsUser) return false;
      
      // Check if unread
      return !notification.readBy.some(read => read.user === userId);
    }).length;

    res.json({
      success: true,
      data: { count: unreadCount },
      message: `You have ${unreadCount} unread notifications`
    });

  } catch (error) {
    console.error("🚨 Get unread count error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread count",
      code: "UNREAD_COUNT_ERROR"
    });
  }
};

/**
 * Mark all notifications as read for user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    let markedCount = 0;

    // Mark all applicable notifications as read
    notifications.forEach(notification => {
      // Check if notification targets this user
      let targetsUser = false;
      if (notification.recipients === 'all') targetsUser = true;
      if (notification.recipients === 'students' && req.user.role === 'user') targetsUser = true;
      if (notification.recipients === 'admins' && req.user.role === 'admin') targetsUser = true;
      if (notification.recipients === 'specific' && 
          notification.specificUsers && 
          notification.specificUsers.includes(userId)) targetsUser = true;
      
      if (targetsUser && !notification.readBy.some(read => read.user === userId)) {
        notification.readBy.push({
          user: userId,
          readAt: new Date()
        });
        notification.deliveryStats.read = notification.readBy.length;
        markedCount++;
      }
    });

    res.json({
      success: true,
      message: `Marked ${markedCount} notifications as read`,
      data: { markedCount }
    });

  } catch (error) {
    console.error("🚨 Mark all as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark all notifications as read",
      code: "MARK_ALL_READ_ERROR"
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filteredNotifications = [...notifications];

    // Apply filters
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (recipients && recipients !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.recipients === recipients);
    }
    
    if (active !== '') {
      filteredNotifications = filteredNotifications.filter(n => n.isActive === (active === 'true'));
    }

    // Sort notifications
    filteredNotifications.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const order = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -order;
      if (aValue > bValue) return order;
      return 0;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(filteredNotifications.length / parseInt(limit)),
          count: filteredNotifications.length,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("🚨 Get all notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
      code: "ADMIN_FETCH_ERROR"
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
      type = 'info',
      priority = 'normal',
      recipients = 'all',
      specificUsers = [],
      scheduledFor,
      expiresAt,
      actionButton
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Create new notification
    const newNotification = {
      _id: String(notificationIdCounter++),
      title,
      message,
      type,
      priority,
      recipients,
      specificUsers: recipients === 'specific' ? specificUsers : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      actionButton,
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user.id,
      readBy: [],
      deliveryStats: { sent: 0, delivered: 0, read: 0 }
    };

    // Calculate target user count (simplified)
    let targetCount = 1; // Default
    if (recipients === 'all') {
      targetCount = await User.countDocuments();
    } else if (recipients === 'students') {
      targetCount = await User.countDocuments({ role: 'user' });
    } else if (recipients === 'admins') {
      targetCount = await User.countDocuments({ role: 'admin' });
    } else if (recipients === 'specific') {
      targetCount = specificUsers.length;
    }

    newNotification.deliveryStats = {
      sent: targetCount,
      delivered: targetCount,
      read: 0
    };

    // Add to notifications array
    notifications.push(newNotification);

    res.status(201).json({
      success: true,
      data: newNotification,
      message: "Notification created successfully"
    });

  } catch (error) {
    console.error("🚨 Create notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create notification",
      code: "CREATE_NOTIFICATION_ERROR"
    });
  }
};

/**
 * Get notification by ID (admin only)
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = notifications.find(n => n._id === id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error("🚨 Get notification by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification",
      code: "FETCH_NOTIFICATION_ERROR"
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

    const notificationIndex = notifications.findIndex(n => n._id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND"
      });
    }

    // Update notification
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...updateData,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    res.json({
      success: true,
      data: notifications[notificationIndex],
      message: "Notification updated successfully"
    });

  } catch (error) {
    console.error("🚨 Update notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update notification",
      code: "UPDATE_NOTIFICATION_ERROR"
    });
  }
};

/**
 * Delete notification (admin only)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationIndex = notifications.findIndex(n => n._id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
        code: "NOTIFICATION_NOT_FOUND"
      });
    }

    // Remove notification
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];

    res.json({
      success: true,
      message: "Notification deleted successfully",
      data: { deletedId: id, title: deletedNotification.title }
    });

  } catch (error) {
    console.error("🚨 Delete notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete notification",
      code: "DELETE_NOTIFICATION_ERROR"
    });
  }
};

/**
 * Get notification analytics (admin only)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const totalNotifications = notifications.length;
    const activeNotifications = notifications.filter(n => n.isActive).length;
    
    const totalSent = notifications.reduce((sum, n) => sum + (n.deliveryStats?.sent || 0), 0);
    const totalDelivered = notifications.reduce((sum, n) => sum + (n.deliveryStats?.delivered || 0), 0);
    const totalRead = notifications.reduce((sum, n) => sum + (n.deliveryStats?.read || 0), 0);
    
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

    // Notifications by type
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        overview: {
          total: totalNotifications,
          active: activeNotifications,
          deliveryRate,
          readRate
        },
        byType,
        deliveryStats: {
          totalSent,
          totalDelivered,
          totalRead
        }
      }
    });

  } catch (error) {
    console.error("🚨 Get analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      code: "ANALYTICS_ERROR"
    });
  }
};
