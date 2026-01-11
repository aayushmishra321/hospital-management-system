const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const { createNotification } = require('./notification.controller');

/* ================================
   CREATE PAYMENT INTENT
   (Stripe Integration)
================================ */
exports.createPaymentIntent = async (req, res) => {
  try {
    console.log('=== CREATE PAYMENT INTENT DEBUG ===');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { billId, amount, currency = 'inr' } = req.body;

    if (!billId || !amount) {
      return res.status(400).json({ message: 'Bill ID and amount are required' });
    }

    // Find the patient record for this user
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Verify the bill belongs to the patient
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    console.log('Bill patientId:', bill.patientId);
    console.log('User ID:', req.user.id);
    console.log('Patient ID:', patient._id);

    // Check if bill belongs to this user
    // Bill.patientId should reference User._id, but let's check both possibilities for robustness
    const billBelongsToUser = bill.patientId.toString() === req.user.id || 
                             bill.patientId.toString() === patient._id.toString();
    
    if (!billBelongsToUser) {
      console.error('Access denied - bill does not belong to user');
      console.error('Bill patientId:', bill.patientId.toString());
      console.error('User ID:', req.user.id);
      console.error('Patient ID:', patient._id.toString());
      return res.status(403).json({ message: 'Access denied - bill does not belong to you' });
    }

    if (bill.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: currency,
      metadata: {
        billId: billId,
        patientId: patient._id.toString(),
        userId: req.user.id,
        hospitalName: 'MediCare Plus Hospital'
      },
      description: `Medical bill payment for ${bill.description || 'Healthcare services'}`
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   CONFIRM PAYMENT
   (After Stripe Payment Success)
================================ */
exports.confirmPayment = async (req, res) => {
  try {
    console.log('=== CONFIRM PAYMENT DEBUG ===');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { paymentIntentId, billId } = req.body;

    if (!paymentIntentId || !billId) {
      return res.status(400).json({ message: 'Payment intent ID and bill ID are required' });
    }

    console.log('Retrieving payment intent from Stripe:', paymentIntentId);
    // Retrieve payment intent from Stripe to verify
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    console.log('Updating bill status for bill:', billId);
    // Update bill status
    const updatedBill = await Billing.findByIdAndUpdate(billId, {
      paymentStatus: 'paid',
      paidAt: new Date(),
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntentId,
      notes: `Paid via Stripe on ${new Date().toLocaleDateString()}`
    }, { new: true });

    if (!updatedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    console.log('Bill updated successfully:', updatedBill._id);

    // Send notification to patient (only if user context is available)
    if (req.user && req.user.id) {
      try {
        console.log('Sending notification to user:', req.user.id);
        await createNotification(req.user.id, {
          title: 'Payment Confirmed',
          message: `Your payment of $${updatedBill.amount} has been successfully processed`,
          type: 'success',
          priority: 'medium',
          actionUrl: '/patient/billing',
          metadata: { 
            billId: billId,
            amount: updatedBill.amount,
            paymentMethod: 'card'
          }
        });
        console.log('Notification sent successfully');
      } catch (notificationError) {
        console.error('Notification failed (non-critical):', notificationError);
        // Don't fail the payment confirmation if notification fails
      }
    } else {
      console.log('No user context available, skipping notification');
    }

    console.log('Payment confirmation completed successfully');

    // Send payment confirmation email
    try {
      console.log('🔄 Sending payment confirmation email with PDF...');
      const emailService = require('../services/emailService');
      const Patient = require('../models/Patient');
      
      // Get patient details for email
      const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', 'name email');
      if (patient && patient.userId && patient.userId.email) {
        console.log('📧 Sending email to:', patient.userId.email);
        const emailResult = await emailService.sendPaymentConfirmationWithPDF(
          patient,
          updatedBill,
          {
            paymentIntentId: paymentIntentId,
            paymentMethod: 'card',
            amount: paymentIntent.amount / 100
          }
        );
        console.log('✅ Payment confirmation email with PDF result:', emailResult);
      } else {
        console.log('⚠️ Patient email not found for payment confirmation');
      }
    } catch (emailError) {
      console.error('❌ Payment confirmation email failed (non-critical):', emailError);
    }

    // Send payment confirmation SMS
    try {
      console.log('🔄 Sending payment confirmation SMS...');
      const smsService = require('../services/smsService');
      const Patient = require('../models/Patient');
      
      // Get patient details for SMS
      const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', 'name email');
      if (patient && patient.phone) {
        console.log('📱 Sending SMS to:', patient.phone);
        const smsResult = await smsService.sendPaymentConfirmationSMS(
          patient.phone,
          patient.userId.name,
          `$${updatedBill.amount}`,
          updatedBill._id.slice(-6).toUpperCase()
        );
        console.log('✅ Payment confirmation SMS result:', smsResult);
      } else {
        console.log('⚠️ Patient phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('❌ Payment confirmation SMS failed (non-critical):', smsError);
    }

    res.json({
      message: 'Payment confirmed successfully',
      bill: updatedBill,
      paymentDetails: {
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: 'card'
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET PAYMENT METHODS
   (For Patient)
================================ */
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        type: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        icon: 'credit-card',
        enabled: true
      }
    ];

    res.json(paymentMethods);

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET PAYMENT HISTORY
   (For Patient)
================================ */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get paid bills for the patient
    const payments = await Billing.find({
      patientId: req.user.id,
      paymentStatus: 'paid'
    })
    .sort({ paidAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalPayments = await Billing.countDocuments({
      patientId: req.user.id,
      paymentStatus: 'paid'
    });

    const totalAmount = await Billing.aggregate([
      { $match: { patientId: req.user.id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        limit
      },
      summary: {
        totalAmountPaid: totalAmount[0]?.total || 0,
        totalTransactions: totalPayments
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   REFUND PAYMENT
   (Admin Only)
================================ */
exports.refundPayment = async (req, res) => {
  try {
    const { billId, reason, amount } = req.body;

    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Bill is not paid, cannot refund' });
    }

    if (!bill.stripePaymentIntentId) {
      return res.status(400).json({ message: 'No Stripe payment found for this bill' });
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: bill.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: 'requested_by_customer',
      metadata: {
        billId: billId,
        refundReason: reason || 'Admin refund'
      }
    });

    // Update bill status
    const refundAmount = refund.amount / 100;
    const isFullRefund = refundAmount >= bill.amount;

    await Billing.findByIdAndUpdate(billId, {
      paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
      refundAmount: refundAmount,
      refundedAt: new Date(),
      refundReason: reason,
      stripeRefundId: refund.id
    });

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: reason
      }
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   WEBHOOK HANDLER
   (Stripe Webhooks)
================================ */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: error.message });
  }
};