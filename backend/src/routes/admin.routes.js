const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const { validateDoctor, handleValidationErrors } = require('../middleware/validation.middleware');
const admin = require('../controllers/admin.controller');

// Public routes
router.get('/departments', admin.getDepartments);

// Admin-only routes
router.get('/dashboard-stats', auth, role('admin'), admin.dashboardStats);
router.get('/system-status', auth, role('admin'), admin.systemStatus);

// Doctor management routes
router.post('/doctors', auth, role('admin'), validateDoctor, handleValidationErrors, admin.addDoctor);
router.get('/doctors', auth, role('admin'), admin.getDoctors);
router.get('/doctors/:id', auth, role('admin'), admin.getDoctor);
router.put('/doctors/:id', auth, role('admin'), admin.updateDoctor);
router.delete('/doctors/:id', auth, role('admin'), admin.deleteDoctor);
router.patch('/doctors/:id/status', auth, role('admin'), admin.toggleDoctorStatus);

// Patient management routes
router.get('/patients', auth, role('admin', 'receptionist'), admin.getPatients);
router.get('/patients/:id', auth, role('admin', 'receptionist'), admin.getPatient);
router.post('/patients', auth, role('admin', 'receptionist'), admin.addPatient);
router.put('/patients/:id', auth, role('admin', 'receptionist'), admin.updatePatient);
router.delete('/patients/:id', auth, role('admin'), admin.deletePatient);
router.patch('/patients/:id/status', auth, role('admin'), admin.togglePatientStatus);
router.patch('/patients/:id/reset-password', auth, role('admin'), admin.resetPatientPassword);

// Receptionist management routes
router.get('/receptionists', auth, role('admin'), admin.getReceptionists);
router.get('/receptionists/:id', auth, role('admin'), admin.getReceptionist);
router.post('/receptionists', auth, role('admin'), admin.addReceptionist);
router.put('/receptionists/:id', auth, role('admin'), admin.updateReceptionist);
router.delete('/receptionists/:id', auth, role('admin'), admin.deleteReceptionist);
router.patch('/receptionists/:id/status', auth, role('admin'), admin.toggleReceptionistStatus);
router.patch('/receptionists/:id/reset-password', auth, role('admin'), admin.resetReceptionistPassword);

// Department management routes
router.post('/departments', auth, role('admin'), admin.addDepartment);
router.get('/departments/:id', auth, role('admin'), admin.getDepartment);
router.put('/departments/:id', auth, role('admin'), admin.updateDepartment);
router.delete('/departments/:id', auth, role('admin'), admin.deleteDepartment);

// Appointment management routes
router.get('/appointments', auth, role('admin'), admin.getAppointments);
router.get('/appointments/:id', auth, role('admin'), admin.getAppointment);
router.post('/appointments', auth, role('admin'), admin.createAppointment);
router.put('/appointments/:id', auth, role('admin'), admin.updateAppointment);
router.delete('/appointments/:id', auth, role('admin'), admin.deleteAppointment);
router.patch('/appointments/:id/checkin', auth, role('admin'), admin.checkinAppointment);
router.patch('/appointments/:id/complete', auth, role('admin'), admin.completeAppointment);
router.patch('/appointments/:id/reschedule', auth, role('admin'), admin.rescheduleAppointment);
router.patch('/appointments/:id/cancel', auth, role('admin'), admin.cancelAppointment);

// Analytics routes
router.get('/analytics', auth, role('admin'), admin.analytics);
router.get('/analytics/export', auth, role('admin'), admin.exportAnalytics);

module.exports = router;
