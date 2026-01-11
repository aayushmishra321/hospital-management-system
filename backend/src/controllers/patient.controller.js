const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const Billing = require('../models/Billing');
const Doctor = require('../models/Doctor');
const { createNotification } = require('../controllers/notification.controller');

/* ================================
   GET PATIENT DASHBOARD
   (Patient)
================================ */
exports.getPatientDashboard = async (req, res) => {
  try {
    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: patient._id,
      date: { $gte: today },
      status: { $in: ['scheduled', 'booked', 'confirmed'] }
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({
      patientId: req.user.id
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(3);

    // Get unpaid bills
    const unpaidBills = await Billing.find({
      patientId: req.user.id,
      paymentStatus: 'unpaid'
    }).sort({ createdAt: -1 });

    // Get recent medical records
    const recentMedicalRecords = await MedicalRecord.find({
      patientId: req.user.id
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(3);

    // Calculate totals
    const totalAppointments = await Appointment.countDocuments({ patientId: patient._id });
    const totalPrescriptions = await Prescription.countDocuments({ patientId: req.user.id });
    const totalUnpaidAmount = unpaidBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

    const dashboard = {
      patient: {
        id: patient._id,
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      stats: {
        totalAppointments,
        upcomingAppointments: upcomingAppointments.length,
        totalPrescriptions,
        unpaidBills: unpaidBills.length,
        totalUnpaidAmount
      },
      upcomingAppointments,
      recentPrescriptions,
      unpaidBills,
      recentMedicalRecords
    };

    res.json(dashboard);
  } catch (err) {
    console.error('Get patient dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   BOOK APPOINTMENT
   (Patient)
================================ */
exports.bookAppointment = async (req, res) => {
  try {
    console.log('=== BOOK APPOINTMENT DEBUG ===');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Doctor, date, and time are required' });
    }

    console.log('Finding patient record for user:', req.user.id);
    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      console.error('Patient profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    console.log('Patient found:', patient._id);
    console.log('Creating appointment with data:', {
      patientId: patient._id,
      doctorId,
      date: new Date(appointmentDate),
      time: appointmentTime,
      reason,
      status: 'scheduled'
    });

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date: new Date(appointmentDate),
      time: appointmentTime,
      reason,
      status: 'scheduled',
      createdBy: 'patient'
    });

    console.log('Appointment created:', appointment._id);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    console.log('Populated appointment:', populatedAppointment);

    // Send notification to patient
    try {
      console.log('Sending notification to patient:', req.user.id);
      await createNotification(req.user.id, {
        title: 'Appointment Booked Successfully',
        message: `Your appointment with Dr. ${populatedAppointment.doctorId.userId.name} has been scheduled for ${new Date(appointmentDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${appointmentTime}`,
        type: 'appointment',
        priority: 'high',
        actionUrl: '/patient/appointments',
        metadata: { 
          appointmentId: appointment._id, 
          action: 'booked',
          doctorName: populatedAppointment.doctorId.userId.name,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime
        }
      });
      console.log('Patient notification sent successfully');
    } catch (notificationError) {
      console.error('Patient notification failed:', notificationError);
    }

    // Send email confirmation to patient
    try {
      console.log('Sending appointment confirmation email to patient');
      const emailService = require('../services/emailService');
      await emailService.sendAppointmentConfirmation(
        populatedAppointment.patientId,
        populatedAppointment,
        populatedAppointment.doctorId
      );
      console.log('Appointment confirmation email sent successfully');
    } catch (emailError) {
      console.error('Appointment confirmation email failed:', emailError);
    }

    // Send SMS confirmation to patient
    try {
      console.log('Sending appointment confirmation SMS to patient');
      const smsService = require('../services/smsService');
      if (populatedAppointment.patientId.phone) {
        await smsService.sendAppointmentConfirmationSMS(
          populatedAppointment.patientId.phone,
          populatedAppointment.patientId.userId.name,
          populatedAppointment.doctorId.userId.name,
          new Date(appointmentDate).toLocaleDateString(),
          appointmentTime
        );
        console.log('Appointment confirmation SMS sent successfully');
      } else {
        console.log('Patient phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('Appointment confirmation SMS failed:', smsError);
    }

    // Send notification to doctor
    try {
      console.log('Sending notification to doctor:', populatedAppointment.doctorId.userId._id);
      await createNotification(populatedAppointment.doctorId.userId._id, {
        title: 'New Appointment Booked',
        message: `${populatedAppointment.patientId.userId.name} has booked an appointment for ${new Date(appointmentDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${appointmentTime}`,
        type: 'appointment',
        priority: 'high',
        actionUrl: '/doctor/appointments',
        metadata: { 
          appointmentId: appointment._id, 
          action: 'new_booking',
          patientName: populatedAppointment.patientId.userId.name,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime
        }
      });
      console.log('Doctor notification sent successfully');
    } catch (notificationError) {
      console.error('Doctor notification failed:', notificationError);
    }

    console.log('Appointment booking completed successfully');
    res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error('Book appointment error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET PATIENT APPOINTMENTS
================================ */
exports.getPatientAppointments = async (req, res) => {
  try {
    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({
      patientId: patient._id
    }).populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Get patient appointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET MY PRESCRIPTIONS
================================ */
exports.getMyPrescriptions = async (req, res) => {
  try {
    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const prescriptions = await Prescription.find({
      patientId: patient._id
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error('Get my prescriptions error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   RESCHEDULE APPOINTMENT
   (Patient)
================================ */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime, reason } = req.body;

    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the appointment belongs to the patient
    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment can be rescheduled (not completed or cancelled)
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule completed or cancelled appointment' });
    }

    // Check for conflicts with the new time
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(appointmentDate),
      time: appointmentTime,
      status: { $in: ['scheduled', 'confirmed', 'checked-in'] },
      _id: { $ne: id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Doctor is not available at the selected time' });
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      date: new Date(appointmentDate),
      time: appointmentTime,
      reason: reason || appointment.reason,
      status: 'scheduled'
    }, { new: true })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Send notification to doctor
    await createNotification(updatedAppointment.doctorId.userId._id, {
      title: 'Appointment Rescheduled',
      message: `Patient has rescheduled appointment to ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}`,
      type: 'appointment',
      priority: 'medium',
      actionUrl: '/doctor/appointments',
      metadata: { appointmentId: id, action: 'rescheduled' }
    });

    res.json({ 
      message: 'Appointment rescheduled successfully', 
      appointment: updatedAppointment 
    });
  } catch (err) {
    console.error('Reschedule appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CANCEL APPOINTMENT
   (Patient)
================================ */
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the appointment belongs to the patient
    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled appointment' });
    }

    // Update the appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by patient',
      cancelledAt: new Date()
    }, { new: true })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Send notification to doctor
    await createNotification(updatedAppointment.doctorId.userId._id, {
      title: 'Appointment Cancelled',
      message: `Patient has cancelled appointment scheduled for ${new Date(appointment.date).toLocaleDateString()}`,
      type: 'appointment',
      priority: 'high',
      actionUrl: '/doctor/appointments',
      metadata: { appointmentId: id, action: 'cancelled' }
    });

    res.json({ 
      message: 'Appointment cancelled successfully', 
      appointment: updatedAppointment 
    });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CHECK DOCTOR AVAILABILITY
   (Patient)
================================ */
exports.checkDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    // Get doctor's availability settings
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found or not available' });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if doctor works on this day
    if (!doctor.availability.days.includes(dayOfWeek)) {
      return res.json({ 
        available: false, 
        message: 'Doctor is not available on this day',
        availableSlots: []
      });
    }

    // Generate time slots based on doctor's working hours
    const startTime = doctor.availability.startTime || '09:00';
    const endTime = doctor.availability.endTime || '17:00';
    
    const timeSlots = generateTimeSlots(startTime, endTime);

    // Get existing appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      doctorId,
      date: appointmentDate,
      status: { $in: ['scheduled', 'confirmed', 'checked-in'] }
    });

    const bookedTimes = existingAppointments.map(apt => apt.time);
    const availableSlots = timeSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({
      available: availableSlots.length > 0,
      availableSlots,
      bookedSlots: bookedTimes,
      doctorWorkingHours: {
        start: startTime,
        end: endTime,
        days: doctor.availability.days
      }
    });
  } catch (err) {
    console.error('Check doctor availability error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   REQUEST PRESCRIPTION REFILL
   (Patient)
================================ */
exports.requestPrescriptionRefill = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, urgency } = req.body;

    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find the prescription
    const prescription = await Prescription.findById(id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Verify the prescription belongs to the patient
    if (prescription.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Send notification to doctor
    await createNotification(prescription.doctorId.userId._id, {
      title: 'Prescription Refill Request',
      message: `Patient has requested a refill for prescription: ${prescription.medicines.join(', ')}`,
      type: 'info',
      priority: urgency || 'medium',
      actionUrl: '/doctor/prescriptions',
      metadata: { 
        prescriptionId: id, 
        patientMessage: message,
        urgency: urgency || 'medium'
      }
    });

    res.json({ 
      message: 'Refill request sent to doctor successfully',
      prescription: prescription
    });
  } catch (err) {
    console.error('Request prescription refill error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET APPOINTMENT REPORT
   (Patient)
================================ */
exports.getAppointmentReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(id)
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

    // Verify the appointment belongs to the patient
    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get related medical records
    const medicalRecords = await MedicalRecord.find({
      patientId: patient._id,
      appointmentId: id
    });

    // Get related prescriptions
    const prescriptions = await Prescription.find({
      patientId: patient._id,
      appointmentId: id
    });

    const report = {
      appointment: {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        reason: appointment.reason,
        doctor: {
          name: appointment.doctorId.userId.name,
          specialization: appointment.doctorId.specialization
        }
      },
      medicalRecords: medicalRecords.map(record => ({
        diagnosis: record.diagnosis,
        symptoms: record.symptoms,
        treatment: record.treatment,
        notes: record.notes,
        vitalSigns: record.vitalSigns,
        followUpDate: record.followUpDate
      })),
      prescriptions: prescriptions.map(prescription => ({
        medicines: prescription.medicines,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes
      })),
      generatedAt: new Date()
    };

    res.json(report);
  } catch (err) {
    console.error('Get appointment report error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  const current = new Date(start);
  while (current < end) {
    slots.push(current.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }));
    current.setMinutes(current.getMinutes() + 60); // 1-hour slots
  }
  
  return slots;
}

/* ================================
   GET PATIENT BILLING
   (Patient)
================================ */
exports.getPatientBilling = async (req, res) => {
  try {
    console.log('=== GET PATIENT BILLING DEBUG ===');
    console.log('User ID from token:', req.user.id);
    
    // Find the patient record for this user
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    console.log('Patient record found:', !!patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    console.log('Patient ID:', patient._id);
    
    // Query billing using the patient's _id, not the user ID
    const billing = await Billing.find({
      patientId: patient._id
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    console.log('Bills found for patient:', billing.length);
    console.log('Bills data:', billing.map(b => ({
      id: b._id,
      patientId: b.patientId,
      amount: b.amount,
      status: b.paymentStatus,
      appointmentId: b.appointmentId
    })));

    res.json(billing);
  } catch (err) {
    console.error('Get patient billing error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET MEDICAL HISTORY
   (Patient)
================================ */
exports.getMedicalHistory = async (req, res) => {
  try {
    // Find the patient record
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const medicalRecords = await MedicalRecord.find({
      patientId: patient._id
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(medicalRecords);
  } catch (err) {
    console.error('Get medical history error:', err);
    res.status(500).json({ message: err.message });
  }
};
/* ================================
   UPDATE BILL PAYMENT STATUS
   (Patient - Demo Payment)
================================ */
exports.updateBillPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paymentMethod, notes } = req.body;

    // Find the patient record for this user
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Find the bill
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify the bill belongs to the patient
    if (bill.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update bill payment status
    const updatedBill = await Billing.findByIdAndUpdate(billId, {
      paymentStatus: 'paid',
      paidAt: new Date(),
      paymentMethod: paymentMethod || 'card',
      notes: notes || `Paid via ${paymentMethod || 'card'} on ${new Date().toLocaleDateString()}`
    }, { new: true })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Send notification to patient
    await createNotification(req.user.id, {
      title: 'Payment Confirmed',
      message: `Your payment of $${updatedBill.amount} has been successfully processed`,
      type: 'billing',
      priority: 'medium',
      actionUrl: '/patient/billing',
      metadata: { 
        billId: billId,
        amount: updatedBill.amount,
        paymentMethod: paymentMethod || 'card'
      }
    });

    res.json({
      message: 'Payment processed successfully',
      bill: updatedBill
    });

  } catch (err) {
    console.error('Update bill payment error:', err);
    res.status(500).json({ message: err.message });
  }
};