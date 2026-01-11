const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const {
  createBill,
  getBills,
  getMyBills,
  markAsPaid,
  processPayment,
  getBillingAnalytics
} = require('../controllers/billing.controller');

// Admin
router.get('/', auth, role('admin'), getBills);
router.get('/analytics', auth, role('admin'), getBillingAnalytics);

// Patient
router.get('/my', auth, role('patient'), getMyBills);
router.put('/:id/pay', auth, role('patient'), processPayment);

// Admin / Receptionist
router.post('/', auth, role('admin', 'receptionist'), createBill);
router.put('/:id/mark-paid', auth, role('admin', 'receptionist'), markAsPaid);

module.exports = router;
