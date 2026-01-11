const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment',
    required: true
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  medicines: [{
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'filled', 'expired', 'cancelled'],
    default: 'pending'
  },
  filledDate: Date,
  expiryDate: Date,
  refillRequests: [{
    requestedAt: { type: Date, default: Date.now },
    message: String,
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
