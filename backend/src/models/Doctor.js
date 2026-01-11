const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  experience: {
    type: Number,
    min: 0
  },
  qualifications: [String],
  fcmToken: String, // Firebase Cloud Messaging token for push notifications
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for better query performance
doctorSchema.index({ department: 1, isActive: 1 });
doctorSchema.index({ userId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
