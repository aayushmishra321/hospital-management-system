const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getDoctorMedicalRecords,
  getPatientRecords,
  updateMedicalRecord
} = require('../controllers/medicalRecord.controller');

// Patient routes
router.get('/my', auth, role('patient'), getMyMedicalRecords);

// Doctor routes
router.post('/', auth, role('doctor'), createMedicalRecord);
router.get('/doctor', auth, role('doctor'), getDoctorMedicalRecords);
router.put('/:id', auth, role('doctor'), updateMedicalRecord);

// Doctor and Admin routes
router.get('/patient/:patientId', auth, role('doctor', 'admin'), getPatientRecords);

module.exports = router;