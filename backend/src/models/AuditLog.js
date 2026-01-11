const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'PASSWORD_CHANGE', 'PASSWORD_RESET',
      'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'APPOINTMENT_RESCHEDULE',
      'PAYMENT_PROCESS', 'PAYMENT_REFUND',
      'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD',
      'SETTINGS_UPDATE', 'PROFILE_UPDATE',
      'ADMIN_ACTION', 'SYSTEM_ACTION'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: [
      'User', 'Patient', 'Doctor', 'Receptionist',
      'Appointment', 'MedicalRecord', 'Prescription', 'Billing',
      'Department', 'Notification', 'FileUpload', 'UserSettings',
      'System', 'Auth'
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    requestId: String,
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number,
    errorMessage: String
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  category: {
    type: String,
    enum: ['SECURITY', 'DATA', 'SYSTEM', 'USER', 'ADMIN'],
    default: 'USER'
  },
  description: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ success: 1, createdAt: -1 });
auditLogSchema.index({ 'metadata.ipAddress': 1 });

// Static methods for common queries
auditLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ userId })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

auditLogSchema.statics.getSecurityEvents = function(limit = 100) {
  return this.find({ 
    category: 'SECURITY',
    severity: { $in: ['HIGH', 'CRITICAL'] }
  })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

auditLogSchema.statics.getFailedActions = function(limit = 100) {
  return this.find({ success: false })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

auditLogSchema.statics.getResourceActivity = function(resource, resourceId, limit = 50) {
  return this.find({ resource, resourceId })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

auditLogSchema.statics.getActivityByDateRange = function(startDate, endDate, limit = 1000) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);