const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: 'Medical consultation'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partially_paid', 'refunded', 'partially_refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'online', 'bank_transfer'],
    default: 'cash'
  },
  paidAt: {
    type: Date
  },
  notes: String,
  // Stripe integration fields
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  stripeRefundId: {
    type: String,
    sparse: true
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String
  }
}, { timestamps: true });

// Index for better query performance
billingSchema.index({ patientId: 1, createdAt: -1 });
billingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Billing', billingSchema);
