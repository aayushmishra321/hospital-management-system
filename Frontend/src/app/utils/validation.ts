// Form validation utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateForm(data: any, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = `${formatFieldName(field)} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${formatFieldName(field)} must be at least ${rule.minLength} characters`;
      return;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${formatFieldName(field)} must be no more than ${rule.maxLength} characters`;
      return;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = `${formatFieldName(field)} format is invalid`;
      return;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  pincode: /^\d{5,6}$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  date: /^\d{4}-\d{2}-\d{2}$/
};

// Common validation rules
export const CommonRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    maxLength: 100
  },
  password: {
    required: true,
    minLength: 8,
    pattern: ValidationPatterns.password
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: ValidationPatterns.name
  },
  phone: {
    required: true,
    pattern: ValidationPatterns.phone
  },
  pincode: {
    pattern: ValidationPatterns.pincode
  }
};

// Specific validation functions
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!ValidationPatterns.email.test(email)) return 'Invalid email format';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!ValidationPatterns.password.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'Phone number is required';
  if (!ValidationPatterns.phone.test(phone)) return 'Invalid phone number format';
  return null;
}

export function validateDate(date: string, allowPast = false): string | null {
  if (!date) return 'Date is required';
  if (!ValidationPatterns.date.test(date)) return 'Invalid date format';
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!allowPast && selectedDate < today) {
    return 'Date cannot be in the past';
  }
  
  return null;
}

export function validateTime(time: string): string | null {
  if (!time) return 'Time is required';
  if (!ValidationPatterns.time.test(time)) return 'Invalid time format';
  return null;
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${formatFieldName(fieldName)} is required`;
  }
  return null;
}

// Cross-field validation
export function validateTimeRange(startTime: string, endTime: string): string | null {
  if (!startTime || !endTime) return null;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  if (start >= end) {
    return 'End time must be after start time';
  }
  
  return null;
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return 'End date must be after start date';
  }
  
  return null;
}

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
} {
  if (!password) {
    return { score: 0, label: 'No password', color: 'gray', suggestions: [] };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Add lowercase letters');

  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Add uppercase letters');

  // Number check
  if (/\d/.test(password)) score++;
  else suggestions.push('Add numbers');

  // Special character check
  if (/[@$!%*?&]/.test(password)) score++;
  else suggestions.push('Add special characters (@$!%*?&)');

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['red', 'orange', 'yellow', 'blue', 'green'];

  return {
    score,
    label: labels[score - 1] || 'Very Weak',
    color: colors[score - 1] || 'red',
    suggestions
  };
}