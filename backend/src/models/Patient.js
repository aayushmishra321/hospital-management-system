const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  age: Number,
  dateOfBirth: Date, // Added: Store date of birth from registration
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  phone: String,
  address: String,
  pincode: String, // Added: Store pincode from registration
  fcmToken: String, // Firebase Cloud Messaging token for push notifications
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  allergies: [String],
  medicalHistory: [String],
  // Additional useful fields
  occupation: String,
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: false
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  nationality: String,
  identificationNumber: String, // SSN, National ID, etc.
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms'],
    default: 'email'
  }
}, { timestamps: true });

// Index for better query performance
patientSchema.index({ userId: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ bloodGroup: 1 });

// Virtual for calculating age from dateOfBirth
patientSchema.virtual('calculatedAge').get(function() {
  if (!this.dateOfBirth) return this.age;
  return Math.floor((new Date() - new Date(this.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
});

// Method to get full patient info
patientSchema.methods.getFullInfo = function() {
  return {
    ...this.toObject(),
    calculatedAge: this.calculatedAge
  };
};

module.exports = mongoose.model('Patient', patientSchema);
