const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'booked', 'checked-in', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: String,
    enum: ['patient', 'receptionist'],
    required: true
  },
  cancellationReason: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
