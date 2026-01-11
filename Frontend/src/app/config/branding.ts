// Hospital Branding Configuration
export const HOSPITAL_BRANDING = {
  // Hospital Information
  name: 'Healthcare Excellence Multi-Specialty Hospital',
  shortName: 'Healthcare Excellence',
  tagline: 'Where Healing Meets Innovation',
  description: 'India\'s trusted healthcare partner providing world-class medical services',
  
  // Contact Information
  contact: {
    phone: '+91 11 4567-8900',
    emergency: '+91 11 4567-8911',
    email: 'info@healthcareexcellence.in',
    address: 'Sector 15, Dwarka, New Delhi - 110075, India',
    website: 'www.healthcareexcellence.in'
  },
  
  // Services
  services: [
    'Advanced Patient Care Management',
    'Smart Appointment Scheduling', 
    'Comprehensive Health Analytics',
    '24/7 Emergency Services',
    'Specialized Medical Departments',
    'Digital Health Records',
    'NABH Accredited Healthcare',
    'CGHS & ESI Empanelled'
  ],
  
  // Departments
  departments: [
    'Cardiology',
    'Neurology',
    'Orthopedics', 
    'Pediatrics',
    'Emergency Medicine',
    'Internal Medicine',
    'Radiology',
    'Pathology',
    'Gynecology',
    'ENT',
    'Dermatology',
    'Oncology'
  ],
  
  // Brand Colors - Natural Theme
  colors: {
    primary: '#16a085', // Teal
    secondary: '#138d75', // Dark Teal
    accent: '#48c9b0', // Light Teal
    warning: '#f39c12', // Orange
    danger: '#e74c3c', // Red
    success: '#27ae60', // Green
    info: '#5dade2' // Light Blue
  },
  
  // Logo Paths
  logos: {
    main: '/hospital-logo.png',
    admin: '/Public/Admin and doctors/logo.png',
    doctor: '/Public/Admin and doctors/doc.png',
    patient: '/Public/Patient/logo.png',
    receptionist: '/Public/receptionist/receptionist.webp'
  },
  
  // Background Images
  backgrounds: {
    admin: '/Public/Admin and doctors/docHolder.jpg',
    doctor: '/Public/Admin and doctors/docHolder.jpg',
    patient: '/Public/Patient/hero.png',
    receptionist: '/Public/receptionist/receptionisr h.jpeg',
    login: '/Public/Admin and doctors/medical-bg.jpg'
  },
  
  // Social Media (if needed)
  social: {
    facebook: 'https://facebook.com/healthcareexcellence',
    twitter: 'https://twitter.com/healthcareexcellence',
    linkedin: 'https://linkedin.com/company/healthcare-excellence',
    instagram: 'https://instagram.com/healthcareexcellence'
  },
  
  // Operating Hours
  hours: {
    weekdays: '8:00 AM - 8:00 PM',
    weekends: '9:00 AM - 6:00 PM',
    emergency: '24/7 Available'
  },
  
  // Mission & Vision
  mission: 'To provide exceptional healthcare services with compassion, innovation, and excellence, making quality healthcare accessible to all sections of society.',
  vision: 'To be India\'s most trusted healthcare provider, setting benchmarks for medical excellence and patient care.',
  
  // Values
  values: [
    'Patient-Centered Care',
    'Medical Excellence',
    'Compassionate Service',
    'Innovation & Technology',
    'Integrity & Trust',
    'Community Health',
    'Affordable Healthcare',
    'Cultural Sensitivity'
  ],

  // Indian Healthcare Credentials
  credentials: [
    'NABH Accredited',
    'CGHS Empanelled',
    'ESI Approved',
    'AYUSH Certified',
    'ISO 9001:2015 Certified',
    'JCI Standards Compliant'
  ],

  // Currency
  currency: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee'
  }
};

// Helper functions for branding
export const getBrandColor = (type: keyof typeof HOSPITAL_BRANDING.colors) => {
  return HOSPITAL_BRANDING.colors[type];
};

export const getBrandLogo = (role: keyof typeof HOSPITAL_BRANDING.logos) => {
  return HOSPITAL_BRANDING.logos[role];
};

export const getBrandBackground = (role: keyof typeof HOSPITAL_BRANDING.backgrounds) => {
  return HOSPITAL_BRANDING.backgrounds[role];
};

export const getWelcomeMessage = (userName: string) => {
  return `Welcome back to ${HOSPITAL_BRANDING.shortName}, ${userName}!`;
};

export const getRegistrationMessage = () => {
  return `Join ${HOSPITAL_BRANDING.name} - ${HOSPITAL_BRANDING.tagline}`;
};