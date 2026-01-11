const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(auth);

// Get user notifications
router.get('/', getNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read  
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;