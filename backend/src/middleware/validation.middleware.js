const { body, validationResult } = require('express-validator');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['admin', 'doctor', 'patient', 'receptionist'])
    .withMessage('Invalid role')
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Appointment validation
exports.validateAppointment = [
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('doctorId')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

// Prescription validation
exports.validatePrescription = [
  body('appointmentId')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('medicines')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),
  body('medicines.*')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each medicine name must be between 2 and 100 characters')
];

// Billing validation
exports.validateBilling = [
  body('appointmentId')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
];

// Medical record validation
exports.validateMedicalRecord = [
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('diagnosis')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Diagnosis must be between 5 and 500 characters'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Treatment must not exceed 1000 characters')
];

// Doctor validation
exports.validateDoctor = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('specialization')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  body('department')
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('consultationFee')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number')
];