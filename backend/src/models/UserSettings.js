const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    billingAlerts: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'staff-only'],
      default: 'staff-only'
    },
    shareDataForResearch: {
      type: Boolean,
      default: false
    },
    allowMarketing: {
      type: Boolean,
      default: false
    }
  },
  dashboard: {
    defaultView: {
      type: String,
      enum: ['overview', 'appointments', 'patients', 'analytics'],
      default: 'overview'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    showWelcomeMessage: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSettingsSchema.index({ userId: 1 });

module.exports = mongoose.model('UserSettings', userSettingsSchema);