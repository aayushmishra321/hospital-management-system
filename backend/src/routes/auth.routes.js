const router = require('express').Router();
const { validateUserRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation.middleware');
const { validatePatientRegistration, sanitizePatientData } = require('../middleware/patientValidation.middleware');
const c = require('../controllers/auth.controller');

router.post('/signup', 
  sanitizePatientData,
  validatePatientRegistration, 
  validateUserRegistration, 
  handleValidationErrors, 
  c.signup
);

// Add alias for register endpoint
router.post('/register', 
  sanitizePatientData,
  validatePatientRegistration, 
  validateUserRegistration, 
  handleValidationErrors, 
  c.signup
);

router.post('/login', validateLogin, handleValidationErrors, c.login);

module.exports = router;
