const AuditLog = require('../models/AuditLog');

class AuditService {
  constructor() {
    this.actions = {
      CREATE: 'CREATE',
      READ: 'READ',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
      LOGIN: 'LOGIN',
      LOGOUT: 'LOGOUT',
      LOGIN_FAILED: 'LOGIN_FAILED',
      PASSWORD_CHANGE: 'PASSWORD_CHANGE',
      PASSWORD_RESET: 'PASSWORD_RESET',
      APPOINTMENT_BOOK: 'APPOINTMENT_BOOK',
      APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
      APPOINTMENT_RESCHEDULE: 'APPOINTMENT_RESCHEDULE',
      PAYMENT_PROCESS: 'PAYMENT_PROCESS',
      PAYMENT_REFUND: 'PAYMENT_REFUND',
      FILE_UPLOAD: 'FILE_UPLOAD',
      FILE_DELETE: 'FILE_DELETE',
      FILE_DOWNLOAD: 'FILE_DOWNLOAD',
      SETTINGS_UPDATE: 'SETTINGS_UPDATE',
      PROFILE_UPDATE: 'PROFILE_UPDATE',
      ADMIN_ACTION: 'ADMIN_ACTION',
      SYSTEM_ACTION: 'SYSTEM_ACTION'
    };

    this.resources = {
      USER: 'User',
      PATIENT: 'Patient',
      DOCTOR: 'Doctor',
      RECEPTIONIST: 'Receptionist',
      APPOINTMENT: 'Appointment',
      MEDICAL_RECORD: 'MedicalRecord',
      PRESCRIPTION: 'Prescription',
      BILLING: 'Billing',
      DEPARTMENT: 'Department',
      NOTIFICATION: 'Notification',
      FILE_UPLOAD: 'FileUpload',
      USER_SETTINGS: 'UserSettings',
      SYSTEM: 'System',
      AUTH: 'Auth'
    };

    this.severity = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL'
    };

    this.category = {
      SECURITY: 'SECURITY',
      DATA: 'DATA',
      SYSTEM: 'SYSTEM',
      USER: 'USER',
      ADMIN: 'ADMIN'
    };
  }

  /* ================================
     LOG AUDIT EVENT
  ================================ */
  async log({
    userId,
    action,
    resource,
    resourceId = null,
    changes = null,
    metadata = {},
    severity = this.severity.LOW,
    category = this.category.USER,
    description,
    success = true,
    req = null
  }) {
    try {
      // Extract metadata from request if provided
      if (req) {
        metadata = {
          ...metadata,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          sessionId: req.sessionID
        };
      }

      const auditLog = new AuditLog({
        userId,
        action,
        resource,
        resourceId,
        changes,
        metadata,
        severity,
        category,
        description,
        success
      });

      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  }

  /* ================================
     AUTHENTICATION EVENTS
  ================================ */
  async logLogin(userId, req, success = true) {
    return await this.log({
      userId,
      action: this.actions.LOGIN,
      resource: this.resources.AUTH,
      severity: success ? this.severity.LOW : this.severity.HIGH,
      category: this.category.SECURITY,
      description: success ? 'User logged in successfully' : 'Login attempt failed',
      success,
      req
    });
  }

  async logLogout(userId, req) {
    return await this.log({
      userId,
      action: this.actions.LOGOUT,
      resource: this.resources.AUTH,
      severity: this.severity.LOW,
      category: this.category.SECURITY,
      description: 'User logged out',
      req
    });
  }

  async logPasswordChange(userId, req, success = true) {
    return await this.log({
      userId,
      action: this.actions.PASSWORD_CHANGE,
      resource: this.resources.USER,
      resourceId: userId,
      severity: this.severity.MEDIUM,
      category: this.category.SECURITY,
      description: success ? 'Password changed successfully' : 'Password change failed',
      success,
      req
    });
  }

  /* ================================
     DATA OPERATIONS
  ================================ */
  async logCreate(userId, resource, resourceId, data, req) {
    return await this.log({
      userId,
      action: this.actions.CREATE,
      resource,
      resourceId,
      changes: { after: data },
      severity: this.severity.LOW,
      category: this.category.DATA,
      description: `Created ${resource} record`,
      req
    });
  }

  async logUpdate(userId, resource, resourceId, beforeData, afterData, req) {
    return await this.log({
      userId,
      action: this.actions.UPDATE,
      resource,
      resourceId,
      changes: { before: beforeData, after: afterData },
      severity: this.severity.LOW,
      category: this.category.DATA,
      description: `Updated ${resource} record`,
      req
    });
  }

  async logDelete(userId, resource, resourceId, data, req) {
    return await this.log({
      userId,
      action: this.actions.DELETE,
      resource,
      resourceId,
      changes: { before: data },
      severity: this.severity.MEDIUM,
      category: this.category.DATA,
      description: `Deleted ${resource} record`,
      req
    });
  }

  /* ================================
     APPOINTMENT EVENTS
  ================================ */
  async logAppointmentBook(userId, appointmentId, appointmentData, req) {
    return await this.log({
      userId,
      action: this.actions.APPOINTMENT_BOOK,
      resource: this.resources.APPOINTMENT,
      resourceId: appointmentId,
      changes: { after: appointmentData },
      severity: this.severity.LOW,
      category: this.category.USER,
      description: 'Appointment booked',
      req
    });
  }

  async logAppointmentCancel(userId, appointmentId, reason, req) {
    return await this.log({
      userId,
      action: this.actions.APPOINTMENT_CANCEL,
      resource: this.resources.APPOINTMENT,
      resourceId: appointmentId,
      metadata: { reason },
      severity: this.severity.LOW,
      category: this.category.USER,
      description: 'Appointment cancelled',
      req
    });
  }

  /* ================================
     PAYMENT EVENTS
  ================================ */
  async logPayment(userId, paymentData, req, success = true) {
    return await this.log({
      userId,
      action: this.actions.PAYMENT_PROCESS,
      resource: this.resources.BILLING,
      resourceId: paymentData.billingId,
      changes: { after: paymentData },
      severity: success ? this.severity.LOW : this.severity.HIGH,
      category: this.category.DATA,
      description: success ? 'Payment processed successfully' : 'Payment processing failed',
      success,
      req
    });
  }

  /* ================================
     FILE OPERATIONS
  ================================ */
  async logFileUpload(userId, fileId, fileData, req) {
    return await this.log({
      userId,
      action: this.actions.FILE_UPLOAD,
      resource: this.resources.FILE_UPLOAD,
      resourceId: fileId,
      changes: { after: fileData },
      severity: this.severity.LOW,
      category: this.category.DATA,
      description: `File uploaded: ${fileData.originalName}`,
      req
    });
  }

  async logFileDelete(userId, fileId, fileData, req) {
    return await this.log({
      userId,
      action: this.actions.FILE_DELETE,
      resource: this.resources.FILE_UPLOAD,
      resourceId: fileId,
      changes: { before: fileData },
      severity: this.severity.MEDIUM,
      category: this.category.DATA,
      description: `File deleted: ${fileData.originalName}`,
      req
    });
  }

  async logFileDownload(userId, fileId, fileName, req) {
    return await this.log({
      userId,
      action: this.actions.FILE_DOWNLOAD,
      resource: this.resources.FILE_UPLOAD,
      resourceId: fileId,
      severity: this.severity.LOW,
      category: this.category.USER,
      description: `File downloaded: ${fileName}`,
      req
    });
  }

  /* ================================
     ADMIN ACTIONS
  ================================ */
  async logAdminAction(userId, action, resource, resourceId, description, req, severity = this.severity.MEDIUM) {
    return await this.log({
      userId,
      action: this.actions.ADMIN_ACTION,
      resource,
      resourceId,
      severity,
      category: this.category.ADMIN,
      description: `Admin action: ${description}`,
      req
    });
  }

  /* ================================
     SECURITY EVENTS
  ================================ */
  async logSecurityEvent(userId, description, req, severity = this.severity.HIGH) {
    return await this.log({
      userId,
      action: this.actions.SYSTEM_ACTION,
      resource: this.resources.SYSTEM,
      severity,
      category: this.category.SECURITY,
      description: `Security event: ${description}`,
      req
    });
  }

  /* ================================
     QUERY METHODS
  ================================ */
  async getUserActivity(userId, limit = 50) {
    return await AuditLog.getUserActivity(userId, limit);
  }

  async getSecurityEvents(limit = 100) {
    return await AuditLog.getSecurityEvents(limit);
  }

  async getFailedActions(limit = 100) {
    return await AuditLog.getFailedActions(limit);
  }

  async getResourceActivity(resource, resourceId, limit = 50) {
    return await AuditLog.getResourceActivity(resource, resourceId, limit);
  }

  async getActivityByDateRange(startDate, endDate, limit = 1000) {
    return await AuditLog.getActivityByDateRange(startDate, endDate, limit);
  }

  async getAuditStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          successfulEvents: {
            $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
          },
          failedEvents: {
            $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
          },
          securityEvents: {
            $sum: { $cond: [{ $eq: ['$category', 'SECURITY'] }, 1, 0] }
          },
          criticalEvents: {
            $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      securityEvents: 0,
      criticalEvents: 0
    };
  }
}

module.exports = new AuditService();