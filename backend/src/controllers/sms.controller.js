const smsService = require('../services/smsService');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

class SMSController {
  // Send SMS to a specific patient
  async sendSMS(req, res) {
    try {
      const { patientId, message } = req.body;

      if (!patientId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID and message are required'
        });
      }

      // Get patient details
      const patient = await Patient.findById(patientId).populate('userId');
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (!patient.phone) {
        return res.status(400).json({
          success: false,
          message: 'Patient phone number not available'
        });
      }

      // Send SMS
      const result = await smsService.sendSMS(patient.phone, message);

      res.json({
        success: result.success,
        message: result.success ? 'SMS sent successfully' : 'Failed to send SMS',
        data: result
      });

    } catch (error) {
      console.error('SMS sending error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Send bulk SMS to multiple patients
  async sendBulkSMS(req, res) {
    try {
      const { patientIds, message } = req.body;

      if (!patientIds || !Array.isArray(patientIds) || !message) {
        return res.status(400).json({
          success: false,
          message: 'Patient IDs array and message are required'
        });
      }

      // Get patients
      const patients = await Patient.find({
        _id: { $in: patientIds }
      }).populate('userId');

      if (patients.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No patients found'
        });
      }

      // Prepare recipients
      const recipients = patients
        .filter(patient => patient.phone)
        .map(patient => ({
          phone: patient.phone,
          name: patient.userId?.name || 'Patient'
        }));

      if (recipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No patients with valid phone numbers found'
        });
      }

      // Send bulk SMS
      const results = await smsService.sendBulkSMS(recipients, message);

      const successCount = results.filter(r => r.result.success).length;
      const failureCount = results.length - successCount;

      res.json({
        success: true,
        message: `SMS sent to ${successCount} patients, ${failureCount} failed`,
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          results: results
        }
      });

    } catch (error) {
      console.error('Bulk SMS sending error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Send appointment confirmation SMS
  async sendAppointmentConfirmation(req, res) {
    try {
      const { appointmentId } = req.body;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message: 'Appointment ID is required'
        });
      }

      // This would typically fetch appointment details from database
      // For now, we'll simulate the data structure
      const appointment = {
        _id: appointmentId,
        date: new Date(),
        time: '10:00 AM'
      };

      const patient = {
        userId: { name: 'John Doe' },
        phone: '+1234567890',
        fcmToken: null
      };

      const doctor = {
        userId: { name: 'Dr. Smith' },
        department: { name: 'Cardiology' }
      };

      const result = await smsService.sendAppointmentConfirmation(patient, appointment, doctor);

      res.json({
        success: result.success,
        message: result.success ? 'Appointment confirmation sent' : 'Failed to send confirmation',
        data: result
      });

    } catch (error) {
      console.error('Appointment confirmation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Send push notification
  async sendPushNotification(req, res) {
    try {
      const { fcmToken, title, body, data } = req.body;

      if (!fcmToken || !title || !body) {
        return res.status(400).json({
          success: false,
          message: 'FCM token, title, and body are required'
        });
      }

      const result = await smsService.sendPushNotification(fcmToken, title, body, data);

      res.json({
        success: result.success,
        message: result.success ? 'Push notification sent' : 'Failed to send notification',
        data: result
      });

    } catch (error) {
      console.error('Push notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get SMS logs
  async getSMSLogs(req, res) {
    try {
      const { limit = 100 } = req.query;

      const result = await smsService.getSMSLogs(parseInt(limit));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch SMS logs',
          error: result.error
        });
      }

      res.json({
        success: true,
        message: 'SMS logs retrieved successfully',
        data: result.logs
      });

    } catch (error) {
      console.error('SMS logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Test SMS service
  async testSMS(req, res) {
    try {
      const { phone, message = 'Test message from Hospital Management System' } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const result = await smsService.sendSMS(phone, message);

      res.json({
        success: result.success,
        message: result.success ? 'Test SMS sent successfully' : 'Failed to send test SMS',
        data: result
      });

    } catch (error) {
      console.error('Test SMS error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new SMSController();