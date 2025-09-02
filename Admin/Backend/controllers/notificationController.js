const Notification = require('../models/Notification');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');

// Get all notifications with pagination and filters
exports.getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type = '',
      recipients = '',
      active = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (recipients && recipients !== 'all') {
      query.recipients = recipients;
    }
    
    if (active !== '') {
      query.isActive = active === 'true';
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(query)
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalNotifications / parseInt(limit)),
          count: totalNotifications,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id)
      .populate('createdBy', 'name email')
      .populate('specificUsers', 'name email')
      .populate('readBy.user', 'name email');
      
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification details'
    });
  }
};

// Create new notification
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      recipients,
      specificUsers,
      scheduledFor,
      expiresAt,
      actionButton
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Validate specific users if recipients is 'specific'
    if (recipients === 'specific' && (!specificUsers || specificUsers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Specific users must be selected when recipients is set to specific'
      });
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      recipients,
      specificUsers: recipients === 'specific' ? specificUsers : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      actionButton,
      createdBy: req.user.id
    });

    // Calculate delivery stats based on recipients
    let targetUserCount = 0;
    if (recipients === 'all') {
      targetUserCount = await User.countDocuments();
    } else if (recipients === 'students') {
      targetUserCount = await User.countDocuments({ role: 'user' });
    } else if (recipients === 'admins') {
      targetUserCount = await User.countDocuments({ role: 'admin' });
    } else if (recipients === 'specific') {
      targetUserCount = specificUsers.length;
    }

    // Update delivery stats
    notification.deliveryStats.sent = targetUserCount;
    notification.deliveryStats.delivered = targetUserCount;
    await notification.save();

    // Log the action
    await SystemLog.create({
      level: 'info',
      message: `Notification "${title}" created and sent to ${recipients}`,
      module: 'notification-management',
      action: 'create-notification',
      userId: req.user.id,
      metadata: { 
        notificationId: notification._id, 
        recipients, 
        targetCount: targetUserCount,
        type,
        priority
      }
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created and sent successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

// Update notification
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if notification exists
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    // Log the action
    await SystemLog.create({
      level: 'info',
      message: `Notification "${updatedNotification.title}" updated by admin`,
      module: 'notification-management',
      action: 'update-notification',
      userId: req.user.id,
      metadata: { notificationId: id, changes: Object.keys(updateData) }
    });

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if notification exists
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(id);

    // Log the action
    await SystemLog.create({
      level: 'warn',
      message: `Notification "${notification.title}" deleted by admin`,
      module: 'notification-management',
      action: 'delete-notification',
      userId: req.user.id,
      metadata: { deletedNotificationId: id, notificationTitle: notification.title }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Mark notification as read for user
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user token missing or invalid'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if already read
    const alreadyRead = notification.readBy.some(
      read => read.user.toString() === userId
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      // Update read count
      notification.deliveryStats.read = notification.readBy.length;
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Get notification analytics
exports.getNotificationAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
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
      engagementStats
    ] = await Promise.all([
      Notification.countDocuments({ createdAt: { $gte: dateFilter } }),
      Notification.countDocuments({ 
        createdAt: { $gte: dateFilter },
        isActive: true 
      }),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$deliveryStats.sent' },
            totalDelivered: { $sum: '$deliveryStats.delivered' },
            totalRead: { $sum: '$deliveryStats.read' }
          }
        }
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $addFields: {
            readRate: {
              $cond: [
                { $eq: ['$deliveryStats.delivered', 0] },
                0,
                { $multiply: [
                  { $divide: ['$deliveryStats.read', '$deliveryStats.delivered'] },
                  100
                ]}
              ]
            }
          }
        },
        {
          $group: {
            _id: '$type',
            avgReadRate: { $avg: '$readRate' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const delivery = deliveryStats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0
    };

    const deliveryRate = delivery.totalSent > 0 
      ? Math.round((delivery.totalDelivered / delivery.totalSent) * 100)
      : 0;
    
    const readRate = delivery.totalDelivered > 0 
      ? Math.round((delivery.totalRead / delivery.totalDelivered) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total: totalNotifications,
          active: activeNotifications,
          deliveryRate,
          readRate
        },
        byType: notificationsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        engagement: engagementStats.map(stat => ({
          type: stat._id,
          averageReadRate: Math.round(stat.avgReadRate || 0),
          count: stat.count
        })),
        deliveryStats: delivery
      }
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification analytics'
    });
  }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user token missing or invalid'
      });
    }
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    // Build query for user's notifications
    const now = new Date();
    let query = {
      isActive: true,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ],
      $or: [
        { recipients: 'all' },
        { recipients: 'students', $and: [{ /* user role check */ }] },
        { recipients: 'specific', specificUsers: userId }
      ]
    };

    // Get user role for filtering
    const user = await User.findById(userId).select('role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      });
    }
    if (user.role === 'user') {
      query.$or[1].recipients = 'students';
    } else {
      query.$or[1] = { recipients: 'admins' };
    }

    // Filter for unread only
    if (unreadOnly === 'true') {
      query['readBy.user'] = { $ne: userId };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    // Add isRead flag for current user
    const notificationsWithReadStatus = notifications.map(notification => {
      const isRead = Array.isArray(notification.readBy)
        ? notification.readBy.some(read => read.user.toString() === userId)
        : false;
      return {
        ...notification.toObject(),
        isRead
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
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications'
    });
  }
};
