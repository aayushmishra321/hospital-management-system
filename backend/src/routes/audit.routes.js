const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');
const {
  getAuditLogs,
  getUserActivity,
  getSecurityEvents,
  getFailedActions,
  getResourceActivity,
  getAuditStats,
  exportAuditLogs,
  cleanupAuditLogs
} = require('../controllers/audit.controller');

// All audit routes require admin authentication
router.use(auth);
router.use(adminAuth);

// Get audit logs with filtering
router.get('/', getAuditLogs);

// Get audit statistics
router.get('/stats', getAuditStats);

// Get security events
router.get('/security', getSecurityEvents);

// Get failed actions
router.get('/failed', getFailedActions);

// Export audit logs
router.get('/export', exportAuditLogs);

// Get user activity
router.get('/user/:userId', getUserActivity);

// Get resource activity
router.get('/resource/:resource/:resourceId', getResourceActivity);

// Cleanup old audit logs
router.delete('/cleanup', cleanupAuditLogs);

module.exports = router;