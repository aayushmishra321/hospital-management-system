const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const {
  getPatientDashboard,
  bookAppointment,
  getPatientAppointments,
  getMyPrescriptions,
  rescheduleAppointment,
  cancelAppointment,
  checkDoctorAvailability,
  requestPrescriptionRefill,
  getAppointmentReport,
  getPatientBilling,
  getMedicalHistory,
  updateBillPayment
} = require('../controllers/patient.controller');

// Dashboard route
router.get('/dashboard', auth, role('patient'), getPatientDashboard);

// Appointment routes
router.post('/appointments', auth, role('patient'), bookAppointment);
router.get('/appointments', auth, role('patient'), getPatientAppointments);
router.put('/appointments/:id/reschedule', auth, role('patient'), rescheduleAppointment);
router.delete('/appointments/:id/cancel', auth, role('patient'), cancelAppointment);
router.get('/appointments/:id/report', auth, role('patient'), getAppointmentReport);

// Doctor availability
router.get('/doctor-availability', auth, role('patient'), checkDoctorAvailability);

// Prescription routes
router.get('/prescriptions', auth, role('patient'), getMyPrescriptions);
router.post('/prescriptions/:id/refill', auth, role('patient'), requestPrescriptionRefill);

// Billing routes
router.get('/billing', auth, role('patient'), getPatientBilling);

// Medical history routes
router.get('/medical-history', auth, role('patient'), getMedicalHistory);

// Payment routes
router.put('/billing/:billId/pay', auth, role('patient'), updateBillPayment);

module.exports = router;