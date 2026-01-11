const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Front Desk', 'Appointments', 'Billing', 'Insurance', 'General']
  },
  shift: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening', 'night']
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true
  },
  experience: {
    type: Number, // years of experience
    required: true,
    min: 0
  },
  skills: [{
    type: String,
    enum: [
      'Customer Service',
      'Phone Etiquette', 
      'Appointment Scheduling',
      'Medical Billing',
      'Insurance Processing',
      'Data Entry',
      'Multi-tasking',
      'Computer Skills',
      'Communication',
      'Problem Solving'
    ]
  }],
  languages: [{
    type: String,
    default: ['English']
  }],
  fcmToken: String, // Firebase Cloud Messaging token for push notifications
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    lastReview: {
      type: Date,
      default: Date.now
    },
    notes: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
receptionistSchema.index({ employeeId: 1 });
receptionistSchema.index({ department: 1 });
receptionistSchema.index({ shift: 1 });
receptionistSchema.index({ isActive: 1 });

module.exports = mongoose.model('Receptionist', receptionistSchema);