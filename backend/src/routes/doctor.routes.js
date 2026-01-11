const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const {
  getDoctorProfile,
  getAvailableDoctors,
  getDoctorAppointments,
  getAppointments,
  completeAppointment,
  rescheduleAppointment,
  cancelAppointment,
  checkinPatient,
  addPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription,
  searchPatients,
  getMedicalRecords,
  getDashboardOverview
} = require('../controllers/doctor.controller');

// Public route for getting available doctors
router.get('/available', getAvailableDoctors);

// Doctor profile route
router.get('/profile', auth, role('doctor'), getDoctorProfile);

// Doctor-only routes
router.get('/dashboard-overview', auth, role('doctor'), getDashboardOverview);
router.get('/appointments', auth, role('doctor'), getDoctorAppointments);
router.get('/medical-records', auth, role('doctor'), getMedicalRecords);
router.put('/appointments/:id/complete', auth, role('doctor'), completeAppointment);
router.put('/appointments/:id/reschedule', auth, role('doctor'), rescheduleAppointment);
router.put('/appointments/:id/cancel', auth, role('doctor'), cancelAppointment);
router.put('/appointments/:id/checkin', auth, role('doctor'), checkinPatient);

router.post('/prescriptions', auth, role('doctor'), addPrescription);
router.get('/prescriptions', auth, role('doctor'), getPrescriptions);
router.put('/prescriptions/:id', auth, role('doctor'), updatePrescription);
router.delete('/prescriptions/:id', auth, role('doctor'), deletePrescription);

router.get('/patients/search', auth, role('doctor'), searchPatients);

module.exports = router;
