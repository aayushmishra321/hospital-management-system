const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['medical-documents', 'prescriptions', 'lab-reports', 'avatars', 'general'],
    default: 'general'
  },
  entityType: {
    type: String,
    enum: ['patient', 'doctor', 'appointment', 'medical-record', 'prescription', 'user'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor', 'Appointment', 'MedicalRecord', 'Prescription', 'User']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    pages: Number,
    // Add other metadata as needed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
fileUploadSchema.index({ entityType: 1, entityId: 1 });
fileUploadSchema.index({ uploadedBy: 1 });
fileUploadSchema.index({ category: 1 });
fileUploadSchema.index({ createdAt: -1 });

// Virtual for file URL
fileUploadSchema.virtual('fullUrl').get(function() {
  return `${process.env.BASE_URL || 'https://hospital-backend-zvjt.onrender.com'}${this.url}`;
});

// Method to check if file is image
fileUploadSchema.methods.isImage = function() {
  return this.mimetype.startsWith('image/');
};

// Method to check if file is document
fileUploadSchema.methods.isDocument = function() {
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return documentTypes.includes(this.mimetype);
};

// Method to get file size in human readable format
fileUploadSchema.methods.getFormattedSize = function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Static method to get files by entity
fileUploadSchema.statics.getFilesByEntity = function(entityType, entityId) {
  return this.find({ 
    entityType, 
    entityId, 
    isActive: true 
  }).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
};

// Static method to get files by category
fileUploadSchema.statics.getFilesByCategory = function(category, limit = 50) {
  return this.find({ 
    category, 
    isActive: true 
  }).populate('uploadedBy', 'name email').sort({ createdAt: -1 }).limit(limit);
};

module.exports = mongoose.model('FileUpload', fileUploadSchema);