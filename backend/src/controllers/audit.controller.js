const auditService = require('../services/auditService');
const AuditLog = require('../models/AuditLog');

/* ================================
   GET AUDIT LOGS
================================ */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resource,
      severity,
      category,
      success,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    // Apply filters
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    if (success !== undefined) filter.success = success === 'true';

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: req.query
    });
  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET USER ACTIVITY
================================ */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const activity = await auditService.getUserActivity(userId, parseInt(limit));

    res.json({
      userId,
      activity,
      total: activity.length
    });
  } catch (err) {
    console.error('Get user activity error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET SECURITY EVENTS
================================ */
exports.getSecurityEvents = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const events = await auditService.getSecurityEvents(parseInt(limit));

    res.json({
      events,
      total: events.length
    });
  } catch (err) {
    console.error('Get security events error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET FAILED ACTIONS
================================ */
exports.getFailedActions = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const failedActions = await auditService.getFailedActions(parseInt(limit));

    res.json({
      failedActions,
      total: failedActions.length
    });
  } catch (err) {
    console.error('Get failed actions error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET RESOURCE ACTIVITY
================================ */
exports.getResourceActivity = async (req, res) => {
  try {
    const { resource, resourceId } = req.params;
    const { limit = 50 } = req.query;

    const activity = await auditService.getResourceActivity(resource, resourceId, parseInt(limit));

    res.json({
      resource,
      resourceId,
      activity,
      total: activity.length
    });
  } catch (err) {
    console.error('Get resource activity error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET AUDIT STATISTICS
================================ */
exports.getAuditStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await auditService.getAuditStats(parseInt(days));

    // Get additional statistics
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      actionStats,
      resourceStats,
      severityStats,
      categoryStats,
      dailyStats
    ] = await Promise.all([
      // Action statistics
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Resource statistics
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Severity statistics
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),

      // Category statistics
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),

      // Daily activity
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            successful: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    res.json({
      period: `${days} days`,
      summary: stats,
      breakdown: {
        actions: actionStats,
        resources: resourceStats,
        severity: severityStats,
        categories: categoryStats,
        daily: dailyStats
      }
    });
  } catch (err) {
    console.error('Get audit stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   EXPORT AUDIT LOGS
================================ */
exports.exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'json',
      startDate,
      endDate,
      userId,
      action,
      resource
    } = req.query;

    const filter = {};

    // Apply filters
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        'Timestamp,User,Action,Resource,Resource ID,Success,Severity,Category,Description,IP Address',
        ...logs.map(log => [
          log.createdAt.toISOString(),
          log.userId?.name || 'Unknown',
          log.action,
          log.resource,
          log.resourceId || '',
          log.success,
          log.severity,
          log.category,
          `"${log.description.replace(/"/g, '""')}"`,
          log.metadata?.ipAddress || ''
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        filters: req.query,
        logs
      });
    }
  } catch (err) {
    console.error('Export audit logs error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DELETE OLD AUDIT LOGS
================================ */
exports.cleanupAuditLogs = async (req, res) => {
  try {
    const { days = 365 } = req.body; // Default: keep logs for 1 year

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
      severity: { $nin: ['HIGH', 'CRITICAL'] } // Keep important logs
    });

    res.json({
      message: 'Audit logs cleanup completed',
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (err) {
    console.error('Cleanup audit logs error:', err);
    res.status(500).json({ message: err.message });
  }
};