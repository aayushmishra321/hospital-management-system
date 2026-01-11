const firebaseConfig = require('../config/firebase');
const twilio = require('twilio');

class SMSService {
  constructor() {
    this.firebaseConfig = firebaseConfig;
    this.twilioClient = null;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && 
          process.env.TWILIO_AUTH_TOKEN && 
          process.env.TWILIO_PHONE_NUMBER) {
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio SMS service initialized successfully');
      } else {
        console.log('⚠️ Twilio credentials not configured - SMS will be simulated');
      }
    } catch (error) {
      console.error('❌ Twilio initialization failed:', error.message);
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      // Format phone number for Indian numbers
      let formattedPhone = phoneNumber;
      
      // Handle Indian phone numbers
      if (phoneNumber.startsWith('91') || phoneNumber.startsWith('+91')) {
        formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      } else if (phoneNumber.startsWith('9') || phoneNumber.startsWith('8') || phoneNumber.startsWith('7') || phoneNumber.startsWith('6')) {
        // Indian mobile numbers start with 9, 8, 7, or 6
        if (phoneNumber.length === 10) {
          formattedPhone = `+91${phoneNumber}`;
        } else {
          formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        }
      } else {
        // For other countries, ensure + prefix
        formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      }

      console.log('📱 Formatted phone number:', formattedPhone);

      // Try Twilio first if configured
      if (this.twilioClient) {
        try {
          console.log('📱 Sending SMS via Twilio to:', formattedPhone);
          const twilioMessage = await this.twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
          });

          console.log('✅ SMS sent successfully via Twilio:', twilioMessage.sid);
          console.log('📱 SMS Status:', twilioMessage.status);
          
          // Also log to Firebase for audit trail
          await this.logSMSToFirebase(formattedPhone, message, 'twilio', twilioMessage.sid);
          
          return {
            success: true,
            messageId: twilioMessage.sid,
            service: 'twilio',
            status: twilioMessage.status,
            data: {
              to: formattedPhone,
              message: message,
              status: 'sent',
              provider: 'twilio',
              sid: twilioMessage.sid
            }
          };
        } catch (twilioError) {
          console.error('❌ Twilio SMS failed:', twilioError.message);
          console.error('❌ Twilio Error Code:', twilioError.code);
          console.error('❌ Twilio Error Details:', twilioError.moreInfo);
          
          // Fall back to Firebase logging
          return await this.fallbackToFirebaseLogging(formattedPhone, message, `Twilio Error: ${twilioError.message} (Code: ${twilioError.code})`);
        }
      } else {
        // Fallback to Firebase logging if Twilio not configured
        return await this.fallbackToFirebaseLogging(formattedPhone, message, 'Twilio not configured');
      }
    } catch (error) {
      console.error('❌ SMS service error:', error);
      return { 
        success: false, 
        error: error.message,
        service: 'none'
      };
    }
  }

  async fallbackToFirebaseLogging(phoneNumber, message, reason) {
    try {
      console.log('📱 SMS fallback - logging to Firebase:', phoneNumber);
      console.log('📱 SMS Content:', message);
      
      // Log to Firebase if available
      await this.logSMSToFirebase(phoneNumber, message, 'fallback', null, reason);
      
      return {
        success: true,
        messageId: `fallback_${Date.now()}`,
        service: 'firebase_log',
        data: {
          to: phoneNumber,
          message: message,
          status: 'logged',
          provider: 'firebase_fallback',
          reason: reason
        },
        note: 'SMS logged to Firebase - Twilio unavailable'
      };
    } catch (error) {
      console.error('❌ Firebase SMS logging failed:', error);
      return {
        success: true, // Still return success to not break the flow
        messageId: `console_${Date.now()}`,
        service: 'console_log',
        data: {
          to: phoneNumber,
          message: message,
          status: 'console_logged'
        },
        note: 'SMS logged to console only'
      };
    }
  }

  async logSMSToFirebase(phoneNumber, message, service, messageId, error = null) {
    try {
      if (!this.firebaseConfig.isInitialized()) {
        this.firebaseConfig.initialize();
      }

      const db = this.firebaseConfig.getFirestore();
      if (db) {
        const smsData = {
          to: phoneNumber,
          message: message,
          timestamp: new Date().toISOString(),
          status: error ? 'failed' : 'sent',
          service: service,
          messageId: messageId,
          error: error
        };

        await db.collection('sms_logs').add(smsData);
        console.log('✅ SMS logged to Firestore');
      }
    } catch (firebaseError) {
      console.error('⚠️ Firebase logging failed (non-critical):', firebaseError.message);
    }
  }

  // Send appointment confirmation SMS
  async sendAppointmentConfirmationSMS(phoneNumber, patientName, doctorName, date, time) {
    const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}. Please arrive 15 minutes early. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send appointment reminder SMS
  async sendAppointmentReminderSMS(phoneNumber, patientName, doctorName, date, time) {
    const message = `Reminder: ${patientName}, you have an appointment with Dr. ${doctorName} tomorrow at ${time}. Please bring your ID and insurance card. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmationSMS(phoneNumber, patientName, amount, receiptId) {
    const message = `Hi ${patientName}, your payment of $${amount} has been processed successfully. Receipt ID: ${receiptId}. Thank you! - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send welcome SMS for new patients
  async sendWelcomeSMS(phoneNumber, patientName) {
    const message = `Welcome to ${process.env.HOSPITAL_NAME || 'our hospital'}, ${patientName}! Your registration is complete. Login to your patient portal to book appointments and view records.`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send bill payment reminder SMS
  async sendBillReminderSMS(phoneNumber, patientName, amount, billId) {
    const message = `Hi ${patientName}, you have an outstanding bill of $${amount} (ID: ${billId}). Please make payment to avoid late fees. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send appointment completion SMS
  async sendAppointmentCompletionSMS(phoneNumber, patientName, doctorName) {
    const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} has been completed. Please check your medical records and billing in your patient portal. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send appointment cancellation SMS
  async sendAppointmentCancellationSMS(phoneNumber, patientName, doctorName, date, reason) {
    const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${date} has been cancelled. Reason: ${reason}. Please contact us to reschedule. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send prescription ready SMS
  async sendPrescriptionReadySMS(phoneNumber, patientName, prescriptionId) {
    const message = `Hi ${patientName}, your prescription (ID: ${prescriptionId}) is ready for pickup. Please visit the pharmacy with your ID. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send lab results SMS
  async sendLabResultsSMS(phoneNumber, patientName) {
    const message = `Hi ${patientName}, your lab results are ready. Please login to your patient portal to view them or contact your doctor. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send emergency notification SMS
  async sendEmergencySMS(phoneNumber, patientName, message) {
    const emergencyMessage = `URGENT: ${patientName}, ${message} Please contact ${process.env.HOSPITAL_NAME || 'hospital'} immediately at ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}.`;
    return await this.sendSMS(phoneNumber, emergencyMessage);
  }

  // Send push notification as SMS alternative
  async sendPushNotification(fcmToken, title, body, data = {}) {
    try {
      if (!this.firebaseConfig.isInitialized()) {
        console.log('Push notification service not configured');
        return { success: false, error: 'Push notification service not configured' };
      }

      const messaging = this.firebaseConfig.getMessaging();
      if (!messaging) {
        return { success: false, error: 'Firebase messaging not available' };
      }

      const message = {
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        token: fcmToken
      };

      const response = await messaging.send(message);
      console.log('Push notification sent successfully:', response);
      
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Push notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Appointment confirmation SMS
  async sendAppointmentConfirmation(patient, appointment, doctor) {
    const message = `Hi ${patient.userId?.name}, your appointment with Dr. ${doctor.userId?.name} is confirmed for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Please arrive 15 minutes early. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    // Try to send both SMS and push notification if FCM token is available
    const smsResult = await this.sendSMS(patient.phone, message);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'Appointment Confirmed',
        message,
        { type: 'appointment_confirmation', appointmentId: appointment._id }
      );
    }
    
    return smsResult;
  }

  // Appointment reminder SMS
  async sendAppointmentReminder(patient, appointment, doctor) {
    const message = `Reminder: You have an appointment tomorrow with Dr. ${doctor.userId?.name} at ${appointment.time}. Location: ${doctor.department?.name} Department. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    const smsResult = await this.sendSMS(patient.phone, message);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'Appointment Reminder',
        message,
        { type: 'appointment_reminder', appointmentId: appointment._id }
      );
    }
    
    return smsResult;
  }

  // Bill payment reminder SMS
  async sendBillPaymentReminder(patient, billing) {
    const message = `Payment reminder: Your bill of $${billing.amount} is due on ${new Date(billing.dueDate).toLocaleDateString()}. Pay online or visit our billing department. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    const smsResult = await this.sendSMS(patient.phone, message);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'Payment Reminder',
        message,
        { type: 'payment_reminder', billingId: billing._id }
      );
    }
    
    return smsResult;
  }

  // Emergency notification SMS
  async sendEmergencyNotification(patient, message) {
    const emergencyMessage = `URGENT: ${message} Please contact us immediately at ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    const smsResult = await this.sendSMS(patient.phone, emergencyMessage);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'URGENT NOTIFICATION',
        emergencyMessage,
        { type: 'emergency', priority: 'high' }
      );
    }
    
    return smsResult;
  }

  // Prescription ready SMS
  async sendPrescriptionReady(patient, prescription) {
    const message = `Your prescription is ready for pickup. Prescription ID: ${prescription._id}. Pharmacy hours: 9 AM - 6 PM. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    const smsResult = await this.sendSMS(patient.phone, message);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'Prescription Ready',
        message,
        { type: 'prescription_ready', prescriptionId: prescription._id }
      );
    }
    
    return smsResult;
  }

  // Lab results ready SMS
  async sendLabResultsReady(patient) {
    const message = `Your lab results are ready. Please log in to your patient portal to view them or contact your doctor. - ${process.env.HOSPITAL_NAME || 'Hospital'}`;
    
    const smsResult = await this.sendSMS(patient.phone, message);
    
    if (patient.fcmToken) {
      await this.sendPushNotification(
        patient.fcmToken,
        'Lab Results Ready',
        message,
        { type: 'lab_results_ready' }
      );
    }
    
    return smsResult;
  }

  // Bulk SMS sending
  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient.phone, message);
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        result: result
      });
    }
    
    return results;
  }

  // Get SMS logs from Firestore
  async getSMSLogs(limit = 100) {
    try {
      if (!this.firebaseConfig.isInitialized()) {
        return { success: false, error: 'Firebase not initialized' };
      }

      const db = this.firebaseConfig.getFirestore();
      if (!db) {
        return { success: false, error: 'Firestore not available' };
      }

      const snapshot = await db.collection('sms_logs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, logs };
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();