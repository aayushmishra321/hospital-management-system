const express = require('express');
const router = express.Router();
const smsController = require('../controllers/sms.controller');
const auth = require('../middleware/auth.middleware');

// All SMS routes require authentication
router.use(auth);

// Send SMS to a specific patient
router.post('/send', smsController.sendSMS);

// Send bulk SMS to multiple patients
router.post('/send-bulk', smsController.sendBulkSMS);

// Send appointment confirmation SMS
router.post('/appointment-confirmation', smsController.sendAppointmentConfirmation);

// Send push notification
router.post('/push-notification', smsController.sendPushNotification);

// Get SMS logs
router.get('/logs', smsController.getSMSLogs);

// Test SMS service
router.post('/test', smsController.testSMS);

module.exports = router;