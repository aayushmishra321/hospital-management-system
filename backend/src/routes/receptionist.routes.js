const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const { validatePatientRegistration, sanitizePatientData } = require('../middleware/patientValidation.middleware');
const { 
  bookAppointment, 
  getAppointments, 
  registerPatient, 
  updateAppointmentStatus,
  checkDoctorAvailability,
  getQueueAnalytics,
  searchPatients,
  getDashboardOverview
} = require('../controllers/receptionist.controller');

router.post('/appointments', auth, role('receptionist'), bookAppointment);
router.get('/appointments', auth, role('receptionist'), getAppointments);
router.put('/appointments/:id/status', auth, role('receptionist'), updateAppointmentStatus);

// Enhanced patient registration with validation
router.post('/patients', 
  auth, 
  role('receptionist'), 
  sanitizePatientData,
  validatePatientRegistration,
  registerPatient
);

// New enhanced endpoints
router.get('/dashboard-overview', auth, role('receptionist'), getDashboardOverview);
router.get('/doctor-availability', auth, role('receptionist'), checkDoctorAvailability);
router.get('/queue-analytics', auth, role('receptionist'), getQueueAnalytics);
router.get('/patients/search', auth, role('receptionist'), searchPatients);

module.exports = router;
