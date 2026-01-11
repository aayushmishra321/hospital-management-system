const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  getDoctorSchedule,
  updateDoctorSchedule,
  getAvailableSlots,
  addException,
  removeException,
  getDoctorAvailability,
  bulkUpdateSchedule,
  getAllDoctorsAvailability
} = require('../controllers/schedule.controller');

// Get doctor's schedule
router.get('/doctor/:doctorId', auth, getDoctorSchedule);

// Update doctor's schedule
router.put('/doctor/:doctorId', auth, updateDoctorSchedule);

// Get available slots for a specific date
router.get('/doctor/:doctorId/slots', auth, getAvailableSlots);

// Get doctor availability (calendar view)
router.get('/doctor/:doctorId/availability', auth, getDoctorAvailability);

// Add exception (leave/vacation)
router.post('/doctor/:doctorId/exceptions', auth, addException);

// Remove exception
router.delete('/doctor/:doctorId/exceptions/:exceptionId', auth, removeException);

// Bulk update schedule
router.put('/doctor/:doctorId/bulk', auth, bulkUpdateSchedule);

// Get all doctors availability summary
router.get('/availability/summary', auth, getAllDoctorsAvailability);

module.exports = router;