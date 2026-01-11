const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const NotificationService = require('../services/notificationService');
const { createNotification } = require('./notification.controller');

/* ================================
   BOOK APPOINTMENT
   (Receptionist)
================================ */
exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
      status: 'scheduled',
      createdBy: 'receptionist'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Send notification to patient
    await createNotification(populatedAppointment.patientId.userId._id, {
      title: 'Appointment Scheduled',
      message: `Your appointment with Dr. ${populatedAppointment.doctorId.userId.name} has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}`,
      type: 'appointment',
      priority: 'high',
      actionUrl: '/patient/appointments',
      metadata: { appointmentId: appointment._id, action: 'scheduled_by_receptionist' }
    });

    // Send notification to doctor
    await createNotification(populatedAppointment.doctorId.userId._id, {
      title: 'New Appointment Scheduled',
      message: `${populatedAppointment.patientId.userId.name} has an appointment scheduled for ${new Date(date).toLocaleDateString()} at ${time}`,
      type: 'appointment',
      priority: 'high',
      actionUrl: '/doctor/appointments',
      metadata: { appointmentId: appointment._id, action: 'scheduled_by_receptionist' }
    });

    res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET APPOINTMENTS
   (Receptionist)
================================ */
exports.getAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   REGISTER PATIENT
   (Receptionist)
================================ */
exports.registerPatient = async (req, res) => {
  try {
    const { 
      name, email, password, age, gender, 
      phone, address, bloodGroup, dateOfBirth,
      occupation, maritalStatus
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient'
    });

    // Calculate age from dateOfBirth if provided, otherwise use provided age
    let calculatedAge = age ? parseInt(age) : null;
    if (dateOfBirth && !age) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Create patient data object, excluding null values for enum fields
    const patientData = {
      userId: user._id,
      age: calculatedAge,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phone: phone || null,
      address: address || null,
      occupation: occupation || null
    };

    // Only add enum fields if they have valid values
    if (gender && ['male', 'female', 'other'].includes(gender)) {
      patientData.gender = gender;
    }
    
    if (bloodGroup && ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
      patientData.bloodGroup = bloodGroup;
    }
    
    if (maritalStatus && ['single', 'married', 'divorced', 'widowed'].includes(maritalStatus)) {
      patientData.maritalStatus = maritalStatus;
    }

    const patient = await Patient.create(patientData);

    const populatedPatient = await Patient.findById(patient._id)
      .populate('userId', 'name email role');

    // Send welcome email to patient
    try {
      console.log('Sending welcome email to patient');
      const emailService = require('../services/emailService');
      await emailService.sendWelcomeEmail(populatedPatient);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Welcome email failed (non-critical):', emailError);
    }

    // Send welcome SMS to patient
    try {
      console.log('Sending welcome SMS to patient');
      const smsService = require('../services/smsService');
      if (populatedPatient.phone) {
        await smsService.sendWelcomeSMS(
          populatedPatient.phone,
          populatedPatient.userId.name
        );
        console.log('Welcome SMS sent successfully');
      } else {
        console.log('Patient phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('Welcome SMS failed (non-critical):', smsError);
    }

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: populatedPatient
    });
  } catch (err) {
    console.error('Register patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE APPOINTMENT STATUS
   (Receptionist)
================================ */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['booked', 'checked-in', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name email')
     .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CHECK DOCTOR AVAILABILITY
   (Receptionist)
================================ */
exports.checkDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date, time } = req.query;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Doctor ID, date, and time are required' });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    res.json({ 
      available: !existingAppointment,
      conflictingAppointment: existingAppointment ? {
        id: existingAppointment._id,
        patientName: existingAppointment.patientId?.name,
        status: existingAppointment.status
      } : null
    });
  } catch (err) {
    console.error('Check doctor availability error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET QUEUE ANALYTICS
   (Receptionist)
================================ */
exports.getQueueAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const appointments = await Appointment.find({ date: today })
      .populate('patientId', 'name')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    const analytics = {
      total: appointments.length,
      byStatus: {
        booked: appointments.filter(a => a.status === 'booked').length,
        'checked-in': appointments.filter(a => a.status === 'checked-in').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      },
      averageWaitTime: '15 minutes', // This would be calculated based on actual data
      peakHours: ['10:00', '14:00', '15:00'] // This would be calculated based on appointment distribution
    };

    res.json(analytics);
  } catch (err) {
    console.error('Get queue analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SEARCH PATIENTS
   (Receptionist)
================================ */
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const patients = await Patient.find()
      .populate({
        path: 'userId',
        match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        select: 'name email'
      })
      .then(patients => patients.filter(p => p.userId)); // Filter out patients where userId didn't match

    res.json(patients);
  } catch (err) {
    console.error('Search patients error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DASHBOARD OVERVIEW
   (Receptionist)
================================ */
exports.getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total patients
    const totalPatients = await Patient.countDocuments();

    // Get today's appointments
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    // Get pending appointments (scheduled/booked)
    const pendingAppointments = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'booked'] }
    });

    // Get completed appointments today
    const completedAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    // Get checked-in patients
    const checkedInPatients = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'checked-in'
    });

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const overview = {
      totalPatients,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      checkedInPatients,
      recentAppointments,
      stats: {
        totalPatients,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        checkedInPatients
      }
    };

    res.json(overview);
  } catch (err) {
    console.error('Get dashboard overview error:', err);
    res.status(500).json({ message: err.message });
  }
};