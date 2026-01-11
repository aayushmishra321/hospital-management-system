const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const payment = require('../controllers/payment.controller');

// Public payment routes (no auth required)
router.get('/methods', payment.getPaymentMethods);

// Patient payment routes
router.post('/create-intent', (req, res, next) => {
  console.log('=== PAYMENT ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  next();
}, auth, role('patient'), payment.createPaymentIntent);
router.post('/confirm', auth, role('patient'), payment.confirmPayment);
router.get('/history', auth, role('patient'), payment.getPaymentHistory);

// Admin payment routes
router.post('/refund', auth, role('admin'), payment.refundPayment);

// Stripe webhook (no auth required)
router.post('/webhook', payment.handleStripeWebhook);

module.exports = router;