const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

/* 📋 GET USER NOTIFICATIONS */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalNotifications = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      notifications,
      totalNotifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit)
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 📖 MARK NOTIFICATION AS READ */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 📖 MARK ALL NOTIFICATIONS AS READ */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🗑️ DELETE NOTIFICATION */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🔔 CREATE NOTIFICATION (Internal use) */
exports.createNotification = async (userId, notificationData) => {
  try {
    const notification = await Notification.create({
      userId,
      ...notificationData
    });
    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    throw err;
  }
};

/* 🔔 CREATE BULK NOTIFICATIONS (Internal use) */
exports.createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (err) {
    console.error('Create bulk notifications error:', err);
    throw err;
  }
};

/* 📊 GET NOTIFICATION STATS */
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats[0]?.byType) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.isRead) {
          typeStats[item.type].unread++;
        }
      });
    }

    res.json({
      total: stats[0]?.total || 0,
      unread: stats[0]?.unread || 0,
      byType: typeStats
    });
  } catch (err) {
    console.error('Get notification stats error:', err);
    res.status(500).json({ message: err.message });
  }
};