const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true // Format: "09:30"
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
});

const dayScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  isWorkingDay: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  slotDuration: {
    type: Number,
    default: 30 // minutes
  },
  breakTimes: [{
    startTime: String,
    endTime: String,
    reason: String
  }],
  timeSlots: [timeSlotSchema]
});

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    unique: true
  },
  weeklySchedule: [dayScheduleSchema],
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['leave', 'vacation', 'sick', 'conference', 'emergency', 'custom'],
      required: true
    },
    reason: String,
    isFullDay: {
      type: Boolean,
      default: true
    },
    startTime: String,
    endTime: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    maxAppointmentsPerDay: {
      type: Number,
      default: 20
    },
    bufferTime: {
      type: Number,
      default: 5 // minutes between appointments
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    advanceBookingDays: {
      type: Number,
      default: 30 // how many days in advance patients can book
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate time slots for a day
dayScheduleSchema.methods.generateTimeSlots = function() {
  const slots = [];
  const startTime = this.startTime;
  const endTime = this.endTime;
  const duration = this.slotDuration;

  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  let current = new Date(start);
  
  while (current < end) {
    const slotStart = current.toTimeString().slice(0, 5);
    current.setMinutes(current.getMinutes() + duration);
    const slotEnd = current.toTimeString().slice(0, 5);

    // Check if this slot conflicts with break times
    const isBreakTime = this.breakTimes.some(breakTime => {
      const breakStart = new Date(`2000-01-01T${breakTime.startTime}:00`);
      const breakEnd = new Date(`2000-01-01T${breakTime.endTime}:00`);
      const slotStartTime = new Date(`2000-01-01T${slotStart}:00`);
      
      return slotStartTime >= breakStart && slotStartTime < breakEnd;
    });

    if (!isBreakTime) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable: true,
        appointmentId: null
      });
    }
  }

  this.timeSlots = slots;
  return slots;
};

// Get available slots for a specific date
doctorScheduleSchema.methods.getAvailableSlots = function(date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const daySchedule = this.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isWorkingDay) {
    return [];
  }

  // Check for exceptions on this date
  const exception = this.exceptions.find(exc => 
    exc.date.toDateString() === date.toDateString()
  );

  if (exception && exception.isFullDay) {
    return [];
  }

  // Generate slots if not already generated
  if (!daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
    daySchedule.generateTimeSlots();
  }

  return daySchedule.timeSlots.filter(slot => slot.isAvailable);
};

// Book a time slot
doctorScheduleSchema.methods.bookSlot = function(date, startTime, appointmentId) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const daySchedule = this.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  
  if (!daySchedule) {
    throw new Error('No schedule found for this day');
  }

  const slot = daySchedule.timeSlots.find(slot => slot.startTime === startTime);
  
  if (!slot) {
    throw new Error('Time slot not found');
  }

  if (!slot.isAvailable) {
    throw new Error('Time slot is not available');
  }

  slot.isAvailable = false;
  slot.appointmentId = appointmentId;
  
  return slot;
};

// Release a time slot
doctorScheduleSchema.methods.releaseSlot = function(date, startTime) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const daySchedule = this.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  
  if (!daySchedule) {
    return false;
  }

  const slot = daySchedule.timeSlots.find(slot => slot.startTime === startTime);
  
  if (slot) {
    slot.isAvailable = true;
    slot.appointmentId = null;
    return true;
  }

  return false;
};

// Initialize default weekly schedule
doctorScheduleSchema.methods.initializeDefaultSchedule = function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  this.weeklySchedule = days.map(day => ({
    dayOfWeek: day,
    isWorkingDay: day !== 'sunday', // Sunday off by default
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    breakTimes: [{
      startTime: '12:00',
      endTime: '13:00',
      reason: 'Lunch Break'
    }],
    timeSlots: []
  }));

  // Generate time slots for each working day
  this.weeklySchedule.forEach(day => {
    if (day.isWorkingDay) {
      day.generateTimeSlots();
    }
  });
};

// Pre-save middleware to update lastUpdated
doctorScheduleSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);