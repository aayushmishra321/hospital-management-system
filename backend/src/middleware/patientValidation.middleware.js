/* ================================
   PATIENT DATA VALIDATION MIDDLEWARE
================================ */

const validatePatientRegistration = (req, res, next) => {
  const { 
    name, email, password, dateOfBirth, 
    phone, age, bloodGroup, gender 
  } = req.body;

  const errors = [];

  // Required field validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email address is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Date of birth validation
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid date of birth format');
    } else if (calculatedAge < 0 || calculatedAge > 150) {
      errors.push('Invalid date of birth - age must be between 0 and 150 years');
    } else if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    }
  }

  // Age validation (if provided separately)
  if (age && (isNaN(age) || age < 0 || age > 150)) {
    errors.push('Age must be a number between 0 and 150');
  }

  // Phone validation
  if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }

  // Blood group validation
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
    errors.push('Invalid blood group');
  }

  // Gender validation
  const validGenders = ['male', 'female', 'other'];
  if (gender && !validGenders.includes(gender)) {
    errors.push('Invalid gender value');
  }

  // Password strength validation
  if (password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strengthScore = 0;
    if (hasUpperCase) strengthScore++;
    if (hasLowerCase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChar) strengthScore++;
    
    if (strengthScore < 3) {
      errors.push('Password must contain at least 3 of: uppercase, lowercase, numbers, special characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

const validatePatientUpdate = (req, res, next) => {
  const { 
    dateOfBirth, phone, age, bloodGroup, 
    gender, emergencyContact 
  } = req.body;

  const errors = [];

  // Date of birth validation (if being updated)
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid date of birth format');
    } else if (calculatedAge < 0 || calculatedAge > 150) {
      errors.push('Invalid date of birth - age must be between 0 and 150 years');
    }
  }

  // Age validation
  if (age !== undefined && (isNaN(age) || age < 0 || age > 150)) {
    errors.push('Age must be a number between 0 and 150');
  }

  // Phone validation
  if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }

  // Blood group validation
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
    errors.push('Invalid blood group');
  }

  // Gender validation
  const validGenders = ['male', 'female', 'other'];
  if (gender && !validGenders.includes(gender)) {
    errors.push('Invalid gender value');
  }

  // Emergency contact validation
  if (emergencyContact) {
    if (emergencyContact.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(emergencyContact.phone.replace(/\s/g, ''))) {
      errors.push('Invalid emergency contact phone number');
    }
    if (emergencyContact.name && emergencyContact.name.trim().length < 2) {
      errors.push('Emergency contact name must be at least 2 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

const sanitizePatientData = (req, res, next) => {
  // Sanitize string inputs
  const stringFields = ['name', 'address', 'occupation', 'nationality'];
  stringFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  });

  // Sanitize phone number
  if (req.body.phone) {
    req.body.phone = req.body.phone.replace(/[^\d\+\-\(\)\s]/g, '');
  }

  // Sanitize emergency contact
  if (req.body.emergencyContact) {
    if (req.body.emergencyContact.name) {
      req.body.emergencyContact.name = req.body.emergencyContact.name.trim();
    }
    if (req.body.emergencyContact.phone) {
      req.body.emergencyContact.phone = req.body.emergencyContact.phone.replace(/[^\d\+\-\(\)\s]/g, '');
    }
  }

  next();
};

module.exports = {
  validatePatientRegistration,
  validatePatientUpdate,
  sanitizePatientData
};