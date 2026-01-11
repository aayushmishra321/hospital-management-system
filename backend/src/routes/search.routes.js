const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  searchAppointments,
  searchPatients,
  searchMedicalRecords,
  searchBilling,
  globalSearch
} = require('../controllers/search.controller');

// Global search (all roles)
router.get('/global', auth, globalSearch);

// Appointments search
router.get('/appointments', auth, role('admin', 'doctor', 'receptionist'), searchAppointments);

// Patients search
router.get('/patients', auth, role('admin', 'doctor', 'receptionist'), searchPatients);

// Medical records search
router.get('/medical-records', auth, role('admin', 'doctor'), searchMedicalRecords);

// Billing search
router.get('/billing', auth, role('admin', 'doctor'), searchBilling);

module.exports = router;