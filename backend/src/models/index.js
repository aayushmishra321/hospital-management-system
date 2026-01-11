/**
 * Central Model Loader
 * This file ensures all Mongoose models are registered before any queries execute
 * Prevents MissingSchemaError by loading models in the correct order
 */

const mongoose = require('mongoose');

// Import all models to register them with Mongoose
const User = require('./User');
const Department = require('./Department');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const MedicalRecord = require('./MedicalRecord');
const Billing = require('./Billing');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Debug: Log all registered models
console.log('📋 Registered Mongoose Models:', mongoose.modelNames());

// Verify critical models are registered
const requiredModels = ['User', 'Doctor', 'Patient', 'Appointment', 'Billing'];
const registeredModels = mongoose.modelNames();

requiredModels.forEach(modelName => {
  if (!registeredModels.includes(modelName)) {
    console.error(`❌ CRITICAL: Model "${modelName}" is not registered!`);
    throw new Error(`MissingSchemaError: Schema hasn't been registered for model "${modelName}"`);
  } else {
    console.log(`✅ Model "${modelName}" is properly registered`);
  }
});

// Export all models for easy access
module.exports = {
  User,
  Department,
  Doctor,
  Patient,
  Appointment,
  Prescription,
  MedicalRecord,
  Billing,
  Notification,
  AuditLog,
  
  // Helper function to check if all models are loaded
  validateModels: () => {
    const currentModels = mongoose.modelNames();
    console.log('🔍 Currently registered models:', currentModels);
    return currentModels.length >= requiredModels.length;
  },
  
  // Get model by name safely
  getModel: (modelName) => {
    try {
      return mongoose.model(modelName);
    } catch (error) {
      console.error(`❌ Model "${modelName}" not found:`, error.message);
      throw error;
    }
  }
};