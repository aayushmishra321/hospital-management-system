const emailService = require('./emailService');
const smsService = require('./smsService');
const notificationService = require('./notificationService');
const UserSettings = require('../models/UserSettings');

class NotificationIntegrationService {
  constructor() {
    this.channels = {
      EMAIL: 'email',
      SMS: 'sms',
      PUSH: 'push',
      IN_APP: 'in_app'
    };
  }

  /* ================================
     GET USER NOTIFICATION PREFERENCES
  ================================ */
  async getUserPreferences(userId) {
    try {
      const settings = await UserSettings.findOne({ userId });
      return settings?.notifications || {
        email: true,
        sms: false,
        push: true,
        appointmentReminders: true,
        billingAlerts: true,
        systemUpdates: false
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        email: true,
        sms: false,
        push: true,
        appointmentReminders: true,
        billingAlerts: true,
        systemUpdates: false
      };
    }
  }

  /* ================================
     SEND MULTI-CHANNEL NOTIFICATION
  ================================ */
  async sendNotification(userId, notificationData, channels = ['in_app']) {
    try {
      const preferences = await this.getUserPreferences(userId);
      const results = {};

      // Always send in-app notification
      if (channels.includes(this.channels.IN_APP)) {
        try {
          const inAppResult = await notificationService.createNotification({
            userId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            data: notificationData.data || {}
          });
          results.inApp = { success: true, data: inAppResult };
        } catch (error) {
          results.inApp = { success: false, error: error.message };
        }
      }

      // Send email if enabled and requested
      if (channels.includes(this.channels.EMAIL) && preferences.email) {
        try {
          const emailResult = await emailService.sendEmail(
            notificationData.email,
            notificationData.emailSubject || notificationData.title,
            notificationData.emailHtml || notificationData.message,
            notificationData.emailText
          );
          results.email = emailResult;
        } catch (error) {
          results.email = { success: false, error: error.message };
        }
      }

      // Send SMS if enabled and requested
      if (channels.includes(this.channels.SMS) && preferences.sms) {
        try {
          const smsResult = await smsService.sendSMS(
            notificationData.phone,
            notificationData.smsMessage || notificationData.message
          );
          results.sms = smsResult;
        } catch (error) {
          results.sms = { success: false, error: error.message };
        }
      }

      // Send push notification if enabled and requested
      if (channels.includes(this.channels.PUSH) && preferences.push) {
        try {
          const pushResult = await smsService.sendPushNotification(
            notificationData.fcmToken,
            {
              title: notificationData.title,
              body: notificationData.message,
              data: notificationData.data || {}
            }
          );
          results.push = pushResult;
        } catch (error) {
          results.push = { success: false, error: error.message };
        }
      }

      return {
        success: true,
        channels: Object.keys(results),
        results
      };
    } catch (error) {
      console.error('Multi-channel notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /* ================================
     APPOINTMENT NOTIFICATIONS
  ================================ */
  async sendAppointmentConfirmation(patient, appointment, doctor) {
    const preferences = await this.getUserPreferences(patient.userId._id);
    
    if (!preferences.appointmentReminders) {
      return { success: false, message: 'Appointment notifications disabled' };
    }

    const notificationData = {
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.userId?.name} has been confirmed for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
      type: 'appointment',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Appointment Confirmation',
      smsMessage: `Appointment confirmed with Dr. ${doctor.userId?.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
      data: {
        appointmentId: appointment._id,
        doctorId: doctor._id,
        patientId: patient._id
      }
    };

    // Use email service for rich HTML content
    if (preferences.email) {
      await emailService.sendAppointmentConfirmation(patient, appointment, doctor);
    }

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.SMS, this.channels.PUSH]
    );
  }

  async sendAppointmentReminder(patient, appointment, doctor) {
    const preferences = await this.getUserPreferences(patient.userId._id);
    
    if (!preferences.appointmentReminders) {
      return { success: false, message: 'Appointment reminders disabled' };
    }

    const notificationData = {
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with Dr. ${doctor.userId?.name} tomorrow at ${appointment.time}`,
      type: 'reminder',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Appointment Reminder - Tomorrow',
      smsMessage: `Reminder: Appointment with Dr. ${doctor.userId?.name} tomorrow at ${appointment.time}`,
      data: {
        appointmentId: appointment._id,
        doctorId: doctor._id,
        patientId: patient._id
      }
    };

    // Use email service for rich HTML content
    if (preferences.email) {
      await emailService.sendAppointmentReminder(patient, appointment, doctor);
    }

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.SMS, this.channels.PUSH]
    );
  }

  /* ================================
     BILLING NOTIFICATIONS
  ================================ */
  async sendBillPaymentReminder(patient, billing) {
    const preferences = await this.getUserPreferences(patient.userId._id);
    
    if (!preferences.billingAlerts) {
      return { success: false, message: 'Billing notifications disabled' };
    }

    const notificationData = {
      title: 'Payment Reminder',
      message: `You have an outstanding bill of $${billing.amount}. Please make payment by ${new Date(billing.dueDate).toLocaleDateString()}`,
      type: 'billing',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Payment Reminder',
      smsMessage: `Payment reminder: $${billing.amount} due by ${new Date(billing.dueDate).toLocaleDateString()}`,
      data: {
        billingId: billing._id,
        patientId: patient._id,
        amount: billing.amount
      }
    };

    // Use email service for rich HTML content
    if (preferences.email) {
      await emailService.sendBillPaymentReminder(patient, billing);
    }

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.SMS, this.channels.PUSH]
    );
  }

  async sendPaymentConfirmation(patient, payment) {
    const preferences = await this.getUserPreferences(patient.userId._id);
    
    if (!preferences.billingAlerts) {
      return { success: false, message: 'Billing notifications disabled' };
    }

    const notificationData = {
      title: 'Payment Confirmed',
      message: `Your payment of $${payment.amount} has been successfully processed. Thank you!`,
      type: 'payment',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Payment Confirmation',
      smsMessage: `Payment confirmed: $${payment.amount}. Thank you!`,
      data: {
        paymentId: payment._id,
        patientId: patient._id,
        amount: payment.amount
      }
    };

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.EMAIL, this.channels.SMS, this.channels.PUSH]
    );
  }

  /* ================================
     MEDICAL NOTIFICATIONS
  ================================ */
  async sendPrescriptionReady(patient, prescription) {
    const notificationData = {
      title: 'Prescription Ready',
      message: `Your prescription is ready for pickup at the pharmacy`,
      type: 'prescription',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Prescription Ready for Pickup',
      smsMessage: 'Your prescription is ready for pickup at the pharmacy',
      data: {
        prescriptionId: prescription._id,
        patientId: patient._id
      }
    };

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.EMAIL, this.channels.SMS, this.channels.PUSH]
    );
  }

  async sendLabResultsAvailable(patient, labResult) {
    const notificationData = {
      title: 'Lab Results Available',
      message: `Your lab results are now available in your patient portal`,
      type: 'lab_results',
      email: patient.userId?.email,
      phone: patient.phone,
      fcmToken: patient.fcmToken,
      emailSubject: 'Lab Results Available',
      smsMessage: 'Your lab results are available in your patient portal',
      data: {
        labResultId: labResult._id,
        patientId: patient._id
      }
    };

    return await this.sendNotification(
      patient.userId._id,
      notificationData,
      [this.channels.IN_APP, this.channels.EMAIL, this.channels.SMS, this.channels.PUSH]
    );
  }

  /* ================================
     SYSTEM NOTIFICATIONS
  ================================ */
  async sendWelcomeNotification(user, userProfile) {
    const notificationData = {
      title: 'Welcome to Our Hospital',
      message: `Welcome ${user.name}! Your account has been created successfully.`,
      type: 'welcome',
      email: user.email,
      phone: userProfile.phone,
      fcmToken: userProfile.fcmToken,
      emailSubject: 'Welcome to Our Hospital',
      smsMessage: `Welcome ${user.name}! Your hospital account is ready.`,
      data: {
        userId: user._id,
        role: user.role
      }
    };

    // Use email service for rich HTML content
    await emailService.sendWelcomeEmail(userProfile);

    return await this.sendNotification(
      user._id,
      notificationData,
      [this.channels.IN_APP, this.channels.SMS, this.channels.PUSH]
    );
  }

  async sendSystemMaintenance(users, maintenanceInfo) {
    const results = [];

    for (const user of users) {
      const preferences = await this.getUserPreferences(user._id);
      
      if (!preferences.systemUpdates) {
        continue;
      }

      const notificationData = {
        title: 'System Maintenance Notice',
        message: `Scheduled maintenance: ${maintenanceInfo.message}`,
        type: 'system',
        email: user.email,
        emailSubject: 'System Maintenance Notice',
        data: maintenanceInfo
      };

      const result = await this.sendNotification(
        user._id,
        notificationData,
        [this.channels.IN_APP, this.channels.EMAIL]
      );

      results.push({ userId: user._id, result });
    }

    return results;
  }

  /* ================================
     BULK NOTIFICATIONS
  ================================ */
  async sendBulkNotification(userIds, notificationData, channels = ['in_app']) {
    const results = [];

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(userId, notificationData, channels);
        results.push({ userId, result });
      } catch (error) {
        results.push({ userId, error: error.message });
      }
    }

    return {
      success: true,
      total: userIds.length,
      results
    };
  }

  /* ================================
     SCHEDULED NOTIFICATIONS
  ================================ */
  async scheduleAppointmentReminders() {
    try {
      // This would typically be called by a cron job
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const Appointment = require('../models/Appointment');
      const Patient = require('../models/Patient');
      const Doctor = require('../models/Doctor');

      const appointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lt: nextDay
        },
        status: 'booked'
      })
      .populate('patientId')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      });

      const results = [];
      for (const appointment of appointments) {
        const result = await this.sendAppointmentReminder(
          appointment.patientId,
          appointment,
          appointment.doctorId
        );
        results.push({ appointmentId: appointment._id, result });
      }

      return {
        success: true,
        processed: appointments.length,
        results
      };
    } catch (error) {
      console.error('Scheduled reminder error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotificationIntegrationService();