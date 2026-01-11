const DoctorSchedule = require('../models/DoctorSchedule');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/* ================================
   GET DOCTOR SCHEDULE
================================ */
exports.getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    let schedule = await DoctorSchedule.findOne({ doctorId })
      .populate('doctorId', 'specialization')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // If no schedule exists, create default one
    if (!schedule) {
      schedule = new DoctorSchedule({ doctorId });
      schedule.initializeDefaultSchedule();
      await schedule.save();
    }

    res.json(schedule);
  } catch (err) {
    console.error('Get doctor schedule error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE DOCTOR SCHEDULE
================================ */
exports.updateDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { weeklySchedule, preferences } = req.body;

    let schedule = await DoctorSchedule.findOne({ doctorId });

    if (!schedule) {
      schedule = new DoctorSchedule({ doctorId });
      schedule.initializeDefaultSchedule();
    }

    // Update weekly schedule
    if (weeklySchedule) {
      schedule.weeklySchedule = weeklySchedule.map(day => {
        // Regenerate time slots when schedule changes
        const daySchedule = { ...day };
        if (daySchedule.isWorkingDay) {
          const tempDay = { ...daySchedule };
          tempDay.generateTimeSlots = schedule.weeklySchedule[0].generateTimeSlots;
          tempDay.generateTimeSlots();
          daySchedule.timeSlots = tempDay.timeSlots;
        }
        return daySchedule;
      });
    }

    // Update preferences
    if (preferences) {
      schedule.preferences = { ...schedule.preferences, ...preferences };
    }

    await schedule.save();

    res.json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (err) {
    console.error('Update doctor schedule error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET AVAILABLE SLOTS
================================ */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    const requestedDate = new Date(date);
    const availableSlots = schedule.getAvailableSlots(requestedDate);

    res.json({
      date: requestedDate,
      availableSlots,
      totalSlots: availableSlots.length
    });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   ADD EXCEPTION (LEAVE/VACATION)
================================ */
exports.addException = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, type, reason, isFullDay, startTime, endTime } = req.body;

    const schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    // Check if exception already exists for this date
    const existingException = schedule.exceptions.find(exc => 
      exc.date.toDateString() === new Date(date).toDateString()
    );

    if (existingException) {
      return res.status(400).json({ message: 'Exception already exists for this date' });
    }

    const exception = {
      date: new Date(date),
      type,
      reason,
      isFullDay: isFullDay !== false, // default to true
      startTime,
      endTime
    };

    schedule.exceptions.push(exception);
    await schedule.save();

    // Cancel existing appointments for this date if full day exception
    if (exception.isFullDay) {
      const appointmentsToCancel = await Appointment.find({
        doctorId,
        date: new Date(date),
        status: { $in: ['booked', 'confirmed'] }
      });

      for (const appointment of appointmentsToCancel) {
        appointment.status = 'cancelled';
        appointment.cancellationReason = `Doctor ${type}: ${reason}`;
        await appointment.save();

        // Release the time slot
        schedule.releaseSlot(new Date(date), appointment.time);
      }

      await schedule.save();
    }

    res.json({
      message: 'Exception added successfully',
      exception: schedule.exceptions[schedule.exceptions.length - 1]
    });
  } catch (err) {
    console.error('Add exception error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   REMOVE EXCEPTION
================================ */
exports.removeException = async (req, res) => {
  try {
    const { doctorId, exceptionId } = req.params;

    const schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    schedule.exceptions = schedule.exceptions.filter(
      exc => exc._id.toString() !== exceptionId
    );

    await schedule.save();

    res.json({ message: 'Exception removed successfully' });
  } catch (err) {
    console.error('Remove exception error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DOCTOR AVAILABILITY (CALENDAR VIEW)
================================ */
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const availability = [];

    // Get appointments in date range
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: start, $lte: end },
      status: { $in: ['booked', 'confirmed', 'checked-in'] }
    }).populate('patientId', 'name');

    // Generate availability for each day
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const daySchedule = schedule.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
      
      // Check for exceptions
      const exception = schedule.exceptions.find(exc => 
        exc.date.toDateString() === date.toDateString()
      );

      const dayAvailability = {
        date: new Date(date),
        dayOfWeek,
        isWorkingDay: daySchedule?.isWorkingDay || false,
        hasException: !!exception,
        exception: exception || null,
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        appointments: []
      };

      if (daySchedule && daySchedule.isWorkingDay && (!exception || !exception.isFullDay)) {
        const availableSlots = schedule.getAvailableSlots(date);
        const dayAppointments = appointments.filter(apt => 
          apt.date.toDateString() === date.toDateString()
        );

        dayAvailability.totalSlots = daySchedule.timeSlots.length;
        dayAvailability.availableSlots = availableSlots.length;
        dayAvailability.bookedSlots = dayAppointments.length;
        dayAvailability.appointments = dayAppointments.map(apt => ({
          _id: apt._id,
          time: apt.time,
          patientName: apt.patientId?.name,
          reason: apt.reason,
          status: apt.status
        }));
      }

      availability.push(dayAvailability);
    }

    res.json({
      doctorId,
      startDate: start,
      endDate: end,
      availability
    });
  } catch (err) {
    console.error('Get doctor availability error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   BULK UPDATE SCHEDULE
================================ */
exports.bulkUpdateSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { 
      weeklySchedule, 
      preferences, 
      exceptions,
      applyToFuture = false 
    } = req.body;

    const schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    // Update weekly schedule
    if (weeklySchedule) {
      schedule.weeklySchedule = weeklySchedule;
      
      // Regenerate time slots for all working days
      schedule.weeklySchedule.forEach(day => {
        if (day.isWorkingDay) {
          day.generateTimeSlots();
        }
      });
    }

    // Update preferences
    if (preferences) {
      schedule.preferences = { ...schedule.preferences, ...preferences };
    }

    // Add multiple exceptions
    if (exceptions && Array.isArray(exceptions)) {
      exceptions.forEach(exception => {
        const existingIndex = schedule.exceptions.findIndex(exc => 
          exc.date.toDateString() === new Date(exception.date).toDateString()
        );

        if (existingIndex >= 0) {
          schedule.exceptions[existingIndex] = { ...schedule.exceptions[existingIndex], ...exception };
        } else {
          schedule.exceptions.push(exception);
        }
      });
    }

    await schedule.save();

    res.json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (err) {
    console.error('Bulk update schedule error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET ALL DOCTORS AVAILABILITY SUMMARY
================================ */
exports.getAllDoctorsAvailability = async (req, res) => {
  try {
    const { date, departmentId } = req.query;

    let doctorQuery = {};
    if (departmentId) {
      doctorQuery.department = departmentId;
    }

    const doctors = await Doctor.find(doctorQuery)
      .populate('userId', 'name email')
      .populate('department', 'name');

    const requestedDate = date ? new Date(date) : new Date();
    const availability = [];

    for (const doctor of doctors) {
      const schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
      
      let doctorAvailability = {
        doctorId: doctor._id,
        doctorName: doctor.userId.name,
        specialization: doctor.specialization,
        department: doctor.department.name,
        isAvailable: false,
        totalSlots: 0,
        availableSlots: 0,
        nextAvailableSlot: null
      };

      if (schedule) {
        const availableSlots = schedule.getAvailableSlots(requestedDate);
        doctorAvailability.isAvailable = availableSlots.length > 0;
        doctorAvailability.availableSlots = availableSlots.length;
        doctorAvailability.totalSlots = schedule.weeklySchedule
          .find(day => day.dayOfWeek === requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' }))
          ?.timeSlots?.length || 0;
        
        if (availableSlots.length > 0) {
          doctorAvailability.nextAvailableSlot = availableSlots[0].startTime;
        }
      }

      availability.push(doctorAvailability);
    }

    res.json({
      date: requestedDate,
      availability
    });
  } catch (err) {
    console.error('Get all doctors availability error:', err);
    res.status(500).json({ message: err.message });
  }
};