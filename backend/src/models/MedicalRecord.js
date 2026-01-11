const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: [String],
  treatment: String,
  notes: String,
  vitals: {
    bloodPressure: String,
    temperature: Number,
    heartRate: Number,
    weight: Number,
    height: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number
  },
  followUpDate: Date,
  attachments: [{
    filename: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better query performance
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
medicalRecordSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);