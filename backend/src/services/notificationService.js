const { createNotification, createBulkNotifications } = require('../controllers/notification.controller');
const emailService = require('./emailService');
const smsService = require('./smsService');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

class NotificationService {
  
  /* 🏥 APPOINTMENT NOTIFICATIONS */
  static async notifyAppointmentCreated(appointment) {
    try {
      // Get populated appointment data
      const populatedAppointment = await require('../models/Appointment')
        .findById(appointment._id)
        .populate('doctorId patientId')
        .populate({
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name email' },
            { path: 'department', select: 'name' }
          ]
        })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email' }
        });

      // Notify doctor (in-app only)
      await createNotification(populatedAppointment.doctorId.userId._id, {
        title: 'New Appointment Scheduled',
        message: `You have a new appointment scheduled for ${new Date(populatedAppointment.date).toLocaleDateString()}`,
        type: 'appointment',
        priority: 'medium',
        actionUrl: '/doctor/appointments',
        metadata: { appointmentId: populatedAppointment._id }
      });

      // Notify patient (in-app + email + SMS)
      await createNotification(populatedAppointment.patientId.userId._id, {
        title: 'Appointment Confirmed',
        message: `Your appointment has been scheduled for ${new Date(populatedAppointment.date).toLocaleDateString()}`,
        type: 'appointment',
        priority: 'medium',
        actionUrl: '/patient/appointments',
        metadata: { appointmentId: populatedAppointment._id }
      });

      // Send email confirmation
      await emailService.sendAppointmentConfirmation(
        populatedAppointment.patientId,
        populatedAppointment,
        populatedAppointment.doctorId
      );

      // Send SMS confirmation
      await smsService.sendAppointmentConfirmation(
        populatedAppointment.patientId,
        populatedAppointment,
        populatedAppointment.doctorId
      );

      console.log('✅ Appointment notifications sent (in-app + email + SMS)');
    } catch (error) {
      console.error('❌ Error sending appointment notifications:', error);
    }
  }

  static async notifyAppointmentCancelled(appointment) {
    try {
      // Notify doctor
      await createNotification(appointment.doctorId, {
        title: 'Appointment Cancelled',
        message: `An appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled`,
        type: 'appointment',
        priority: 'high',
        actionUrl: '/doctor/appointments',
        metadata: { appointmentId: appointment._id }
      });

      // Notify patient
      await createNotification(appointment.patientId, {
        title: 'Appointment Cancelled',
        message: `Your appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled`,
        type: 'appointment',
        priority: 'high',
        actionUrl: '/patient/appointments',
        metadata: { appointmentId: appointment._id }
      });

      console.log('✅ Appointment cancellation notifications sent');
    } catch (error) {
      console.error('❌ Error sending appointment cancellation notifications:', error);
    }
  }

  /* 💊 PRESCRIPTION NOTIFICATIONS */
  static async notifyPrescriptionCreated(prescription) {
    try {
      await createNotification(prescription.patientId, {
        title: 'New Prescription Available',
        message: `Dr. ${prescription.doctorId.name} has prescribed new medication for you`,
        type: 'info',
        priority: 'medium',
        actionUrl: '/patient/prescriptions',
        metadata: { prescriptionId: prescription._id }
      });

      console.log('✅ Prescription notification sent');
    } catch (error) {
      console.error('❌ Error sending prescription notification:', error);
    }
  }

  /* 💰 BILLING NOTIFICATIONS */
  static async notifyBillGenerated(bill) {
    try {
      await createNotification(bill.patientId, {
        title: 'New Bill Generated',
        message: `A new bill of $${bill.amount} has been generated for your recent visit`,
        type: 'billing',
        priority: 'medium',
        actionUrl: '/patient/billing',
        metadata: { billId: bill._id, amount: bill.amount }
      });

      console.log('✅ Bill notification sent');
    } catch (error) {
      console.error('❌ Error sending bill notification:', error);
    }
  }

  static async notifyPaymentReceived(payment) {
    try {
      await createNotification(payment.patientId, {
        title: 'Payment Confirmed',
        message: `Your payment of $${payment.amount} has been successfully processed`,
        type: 'billing',
        priority: 'low',
        actionUrl: '/patient/billing',
        metadata: { paymentId: payment._id, amount: payment.amount }
      });

      console.log('✅ Payment confirmation notification sent');
    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
    }
  }

  /* 👨‍⚕️ DOCTOR NOTIFICATIONS */
  static async notifyDoctorAdded(doctor) {
    try {
      // Get admin users
      const adminUsers = await User.find({ role: 'admin' });
      const adminIds = adminUsers.map(admin => admin._id);

      await createBulkNotifications(adminIds, {
        title: 'New Doctor Added',
        message: `Dr. ${doctor.userId.name} has been added to the ${doctor.department.name} department`,
        type: 'system',
        priority: 'low',
        actionUrl: '/admin/doctors',
        metadata: { doctorId: doctor._id }
      });

      console.log('✅ Doctor addition notifications sent to admins');
    } catch (error) {
      console.error('❌ Error sending doctor addition notifications:', error);
    }
  }

  /* 🧑 PATIENT NOTIFICATIONS */
  static async notifyPatientRegistered(patient) {
    try {
      // Get receptionist users
      const receptionistUsers = await User.find({ role: 'receptionist' });
      const receptionistIds = receptionistUsers.map(receptionist => receptionist._id);

      await createBulkNotifications(receptionistIds, {
        title: 'New Patient Registered',
        message: `${patient.userId.name} has been registered as a new patient`,
        type: 'system',
        priority: 'low',
        actionUrl: '/receptionist/patients',
        metadata: { patientId: patient._id }
      });

      // Send welcome email to patient
      await emailService.sendWelcomeEmail(patient);

      console.log('✅ Patient registration notifications sent to receptionists + welcome email sent');
    } catch (error) {
      console.error('❌ Error sending patient registration notifications:', error);
    }
  }

  /* 📧 EMAIL/SMS UTILITY METHODS */
  static async sendBillPaymentReminder(billing) {
    try {
      const populatedBill = await require('../models/Billing')
        .findById(billing._id)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email' }
        });

      // Send email reminder
      await emailService.sendBillPaymentReminder(populatedBill.patientId, populatedBill);
      
      // Send SMS reminder
      await smsService.sendBillPaymentReminder(populatedBill.patientId, populatedBill);

      console.log('✅ Bill payment reminder sent (email + SMS)');
    } catch (error) {
      console.error('❌ Error sending bill payment reminder:', error);
    }
  }

  static async sendPasswordResetEmail(user, resetToken) {
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
    }
  }

  /* ⏰ REMINDER NOTIFICATIONS */
  static async sendAppointmentReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find appointments for tomorrow
      const Appointment = require('../models/Appointment');
      const appointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lt: nextDay
        },
        status: { $in: ['booked', 'confirmed'] }
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

      for (const appointment of appointments) {
        // Remind patient (in-app + email + SMS)
        await createNotification(appointment.patientId.userId._id, {
          title: 'Appointment Reminder',
          message: `You have an appointment tomorrow at ${appointment.time} with Dr. ${appointment.doctorId.userId.name}`,
          type: 'reminder',
          priority: 'high',
          actionUrl: '/patient/appointments',
          metadata: { appointmentId: appointment._id }
        });

        // Send email reminder
        await emailService.sendAppointmentReminder(
          appointment.patientId,
          appointment,
          appointment.doctorId
        );

        // Send SMS reminder
        await smsService.sendAppointmentReminder(
          appointment.patientId,
          appointment,
          appointment.doctorId
        );

        // Remind doctor (in-app only)
        await createNotification(appointment.doctorId.userId._id, {
          title: 'Appointment Reminder',
          message: `You have an appointment tomorrow at ${appointment.time} with ${appointment.patientId.userId.name}`,
          type: 'reminder',
          priority: 'medium',
          actionUrl: '/doctor/appointments',
          metadata: { appointmentId: appointment._id }
        });
      }

      console.log(`✅ Sent ${appointments.length * 2} appointment reminders (in-app + email + SMS)`);
    } catch (error) {
      console.error('❌ Error sending appointment reminders:', error);
    }
  }

  /* 🚨 SYSTEM ALERTS */
  static async notifySystemAlert(message, priority = 'medium', targetRoles = ['admin']) {
    try {
      const users = await User.find({ role: { $in: targetRoles } });
      const userIds = users.map(user => user._id);

      await createBulkNotifications(userIds, {
        title: 'System Alert',
        message,
        type: 'alert',
        priority,
        actionUrl: '/dashboard',
        metadata: { timestamp: new Date() }
      });

      console.log(`✅ System alert sent to ${userIds.length} users`);
    } catch (error) {
      console.error('❌ Error sending system alert:', error);
    }
  }

  /* 📊 DAILY SUMMARY NOTIFICATIONS */
  static async sendDailySummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's stats
      const Appointment = require('../models/Appointment');
      const todayAppointments = await Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow }
      });

      const Patient = require('../models/Patient');
      const newPatients = await Patient.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // Send to admins
      const adminUsers = await User.find({ role: 'admin' });
      const adminIds = adminUsers.map(admin => admin._id);

      await createBulkNotifications(adminIds, {
        title: 'Daily Summary',
        message: `Today: ${todayAppointments} appointments, ${newPatients} new patients registered`,
        type: 'info',
        priority: 'low',
        actionUrl: '/admin/analytics',
        metadata: { 
          date: today.toISOString(),
          appointments: todayAppointments,
          newPatients 
        }
      });

      console.log('✅ Daily summary sent to admins');
    } catch (error) {
      console.error('❌ Error sending daily summary:', error);
    }
  }
}

module.exports = NotificationService;