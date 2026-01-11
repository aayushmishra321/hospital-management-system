// Route validation utility to ensure all routes are properly configured
export const validateRoute = (path: string, userRole?: string): boolean => {
  // Define valid routes for each role
  const validRoutes = {
    admin: [
      '/admin',
      '/admin/doctors',
      '/admin/receptionists', 
      '/admin/patients',
      '/admin/departments',
      '/admin/analytics',
      '/admin/profile',
      '/admin/settings'
    ],
    doctor: [
      '/doctor',
      '/doctor/appointments',
      '/doctor/records',
      '/doctor/prescriptions',
      '/doctor/create-record',
      '/doctor/schedule',
      '/doctor/profile',
      '/doctor/settings'
    ],
    patient: [
      '/patient',
      '/patient/book',
      '/patient/appointments',
      '/patient/prescriptions',
      '/patient/history',
      '/patient/billing',
      '/patient/profile',
      '/patient/settings'
    ],
    receptionist: [
      '/receptionist',
      '/receptionist/register',
      '/receptionist/schedule',
      '/receptionist/queue',
      '/receptionist/profile',
      '/receptionist/settings'
    ]
  };

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];

  // Check if it's a public route
  if (publicRoutes.includes(path)) {
    return true;
  }

  // Check if user has a role and the route is valid for that role
  if (userRole && validRoutes[userRole as keyof typeof validRoutes]) {
    return validRoutes[userRole as keyof typeof validRoutes].includes(path);
  }

  return false;
};

// Get the appropriate redirect path for a user
export const getRedirectPath = (userRole?: string): string => {
  if (!userRole) return '/login';
  return `/${userRole}`;
};

// Check if a route requires authentication
export const requiresAuth = (path: string): boolean => {
  const publicRoutes = ['/', '/login', '/register'];
  return !publicRoutes.includes(path);
};