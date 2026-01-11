const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { createNotification } = require('../controllers/notification.controller');

/* ================================
   GET DOCTOR PROFILE
   (Doctor)
================================ */
exports.getDoctorProfile = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email')
      .populate('department', 'name');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (err) {
    console.error('Get doctor profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET AVAILABLE DOCTORS
   (Public/Patient/Receptionist)
================================ */
exports.getAvailableDoctors = async (req, res) => {
  try {
    const { department, date } = req.query;
    let filter = { isActive: true };
    
    if (department) {
      filter.department = department;
    }

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email')
      .populate('department', 'name')
      .sort({ consultationFee: 1 });

    // If date is provided, filter by availability
    if (date) {
      const dayOfWeek = new Date(date).toLocaleLowerCase().slice(0, 3) + 'day';
      const availableDoctors = doctors.filter(doctor => 
        doctor.availability?.days?.includes(dayOfWeek)
      );
      return res.json(availableDoctors);
    }

    res.json(doctors);
  } catch (err) {
    console.error('Get available doctors error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DOCTOR APPOINTMENTS
================================ */
exports.getDoctorAppointments = async (req, res) => {
  try {
    // First find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { status, date } = req.query;
    let filter = { doctorId: doctor._id };
    
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
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Get doctor appointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   COMPLETE APPOINTMENT
================================ */
exports.completeAppointment = async (req, res) => {
  try {
    console.log('=== COMPLETE APPOINTMENT DEBUG ===');
    console.log('Appointment ID:', req.params.id);
    console.log('Doctor User ID:', req.user.id);
    
    // First find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!doctor) {
      console.error('Doctor profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    console.log('Doctor found:', doctor._id, doctor.userId.name);

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.error('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Appointment found:', appointment._id, 'Status:', appointment.status);

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      console.error('Access denied - appointment belongs to different doctor');
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    ).populate('patientId', 'name email');

    console.log('Appointment updated to completed');

    // Auto-generate bill when appointment is completed
    const Billing = require('../models/Billing');
    
    // Check if bill already exists for this appointment
    const existingBill = await Billing.findOne({ appointmentId: req.params.id });
    console.log('Existing bill found:', !!existingBill);
    
    if (!existingBill) {
      // Get the patient record to access the userId
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findById(appointment.patientId);
      
      if (patientRecord) {
        console.log('Creating bill for patient:', patientRecord.userId);
        console.log('Doctor consultation fee:', doctor.consultationFee);
        
        const newBill = await Billing.create({
          appointmentId: req.params.id,
          patientId: patientRecord.userId, // Use the User ID, not Patient ID
          doctorId: doctor._id,
          amount: doctor.consultationFee || 500, // Default fee if not set
          description: `Consultation with Dr. ${doctor.userId?.name || 'Doctor'}`,
          paymentStatus: 'unpaid'
        });
        
        console.log('Bill created successfully:', newBill._id);
      } else {
        console.error('Patient record not found for appointment:', req.params.id);
      }
    } else {
      console.log('Bill already exists for this appointment');
    }

    // Auto-generate basic medical record when appointment is completed
    const MedicalRecord = require('../models/MedicalRecord');
    
    // Check if medical record already exists for this appointment
    const existingRecord = await MedicalRecord.findOne({ appointmentId: req.params.id });
    console.log('Existing medical record found:', !!existingRecord);
    
    if (!existingRecord) {
      // Get the patient record to access the userId
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findById(appointment.patientId);
      
      if (patientRecord) {
        console.log('Creating basic medical record for patient:', patientRecord.userId);
        
        const newRecord = await MedicalRecord.create({
          patientId: patientRecord.userId, // Use the User ID, not Patient ID
          doctorId: doctor._id,
          appointmentId: req.params.id,
          diagnosis: 'Consultation completed - awaiting detailed diagnosis',
          symptoms: ['General consultation'],
          treatment: 'Consultation provided',
          notes: `Appointment completed on ${new Date().toLocaleDateString()}. Detailed medical record to be updated by doctor.`
        });
        
        console.log('Basic medical record created successfully:', newRecord._id);
      } else {
        console.error('Patient record not found for medical record creation:', req.params.id);
      }
    } else {
      console.log('Medical record already exists for this appointment');
    }

    // Send appointment completion notification to patient
    try {
      console.log('🔄 Sending appointment completion notifications to patient...');
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findById(appointment.patientId).populate('userId', 'name email');
      
      if (patientRecord) {
        console.log('📧 Patient found for notifications:', patientRecord.userId.name);
        
        // Send in-app notification
        await createNotification(patientRecord.userId._id, {
          title: 'Appointment Completed',
          message: `Your appointment with Dr. ${doctor.userId?.name} has been completed. Please check your medical records and billing for updates.`,
          type: 'appointment',
          priority: 'high',
          actionUrl: '/patient/history',
          metadata: { 
            appointmentId: req.params.id, 
            action: 'completed',
            doctorName: doctor.userId?.name
          }
        });
        console.log('✅ In-app notification sent');

        // Send completion email
        const emailService = require('../services/emailService');
        const emailResult = await emailService.sendAppointmentCompletionEmail(
          patientRecord,
          updatedAppointment,
          doctor
        );
        console.log('✅ Appointment completion email result:', emailResult);

        // Send completion SMS
        const smsService = require('../services/smsService');
        if (patientRecord.phone) {
          const smsResult = await smsService.sendAppointmentCompletionSMS(
            patientRecord.phone,
            patientRecord.userId.name,
            doctor.userId.name
          );
          console.log('✅ Appointment completion SMS result:', smsResult);
        } else {
          console.log('⚠️ Patient phone number not available for SMS');
        }

        console.log('✅ All appointment completion notifications sent successfully');
      } else {
        console.log('⚠️ Patient record not found for notifications');
      }
    } catch (notificationError) {
      console.error('❌ Appointment completion notification failed:', notificationError);
    }

    res.json(updatedAppointment);
  } catch (err) {
    console.error('Complete appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   ADD PRESCRIPTION
================================ */
exports.addPrescription = async (req, res) => {
  try {
    console.log('=== ADD PRESCRIPTION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { appointmentId, patientId, medicines, notes } = req.body;

    if (!appointmentId || !patientId || !medicines || medicines.length === 0) {
      console.error('Missing required fields:', { appointmentId, patientId, medicines: medicines?.length });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!doctor) {
      console.error('Doctor profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    console.log('Doctor found:', doctor._id, doctor.userId.name);

    // Transform medicines array to proper format if needed
    const formattedMedicines = medicines.map(medicine => {
      if (typeof medicine === 'string') {
        // If medicine is just a string, convert to object format
        return {
          name: medicine,
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        };
      } else {
        // If medicine is already an object, use as is
        return medicine;
      }
    });

    console.log('Formatted medicines:', formattedMedicines);

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId: doctor._id,
      medicines: formattedMedicines,
      notes
    });

    console.log('Prescription created:', prescription._id);

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId', 'name email')
      .populate('appointmentId');

    console.log('Prescription populated successfully');

    // Send prescription notification to patient
    try {
      console.log('🔄 Sending prescription notifications to patient...');
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findOne({ userId: patientId }).populate('userId', 'name email');
      
      if (patientRecord) {
        console.log('📧 Patient found for prescription notifications:', patientRecord.userId.name);
        
        // Send in-app notification
        await createNotification(patientId, {
          title: 'New Prescription Available',
          message: `Dr. ${doctor.userId?.name} has prescribed new medications for you. Please check your prescriptions and visit the pharmacy.`,
          type: 'prescription',
          priority: 'high',
          actionUrl: '/patient/prescriptions',
          metadata: { 
            prescriptionId: prescription._id, 
            doctorName: doctor.userId?.name,
            medicineCount: formattedMedicines.length
          }
        });
        console.log('✅ Prescription in-app notification sent');

        // Send prescription email
        const emailService = require('../services/emailService');
        const emailResult = await emailService.sendPrescriptionWithPDF(
          patientRecord,
          prescription,
          doctor
        );
        console.log('✅ Prescription email with PDF result:', emailResult);

        // Send prescription SMS
        const smsService = require('../services/smsService');
        if (patientRecord.phone) {
          const smsResult = await smsService.sendPrescriptionReadySMS(
            patientRecord.phone,
            patientRecord.userId.name,
            prescription._id.toString().slice(-6).toUpperCase()
          );
          console.log('✅ Prescription SMS result:', smsResult);
        } else {
          console.log('⚠️ Patient phone number not available for SMS');
        }

        console.log('✅ All prescription notifications sent successfully');
      } else {
        console.log('⚠️ Patient record not found for prescription notifications');
      }
    } catch (notificationError) {
      console.error('❌ Prescription notification failed:', notificationError);
    }

    res.status(201).json(populatedPrescription);
  } catch (err) {
    console.error('Add prescription error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DOCTOR PRESCRIPTIONS
================================ */
exports.getPrescriptions = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescriptions = await Prescription.find({
      doctorId: doctor._id
    })
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error('Get prescriptions error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE PRESCRIPTION
   (Doctor)
================================ */
exports.updatePrescription = async (req, res) => {
  try {
    const { medicines, notes } = req.body;

    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only the doctor who created the prescription can update it
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { medicines, notes },
      { new: true }
    )
      .populate('patientId', 'name email')
      .populate('appointmentId');

    res.json(updatedPrescription);
  } catch (err) {
    console.error('Update prescription error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DELETE PRESCRIPTION
   (Doctor)
================================ */
exports.deletePrescription = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only the doctor who created the prescription can delete it
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('Delete prescription error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   RESCHEDULE APPOINTMENT
   (Doctor)
================================ */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, time },
      { new: true }
    ).populate('patientId', 'name email');

    res.json(updatedAppointment);
  } catch (err) {
    console.error('Reschedule appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CANCEL APPOINTMENT
   (Doctor)
================================ */
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by doctor'
      },
      { new: true }
    ).populate('patientId', 'name email');

    res.json(updatedAppointment);
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CHECK-IN PATIENT
   (Doctor)
================================ */
exports.checkinPatient = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in' },
      { new: true }
    ).populate('patientId', 'name email');

    res.json(updatedAppointment);
  } catch (err) {
    console.error('Check-in patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SEARCH PATIENTS
   (Doctor)
================================ */
exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find patients who have appointments with this doctor
    const appointments = await Appointment.find({
      doctorId: doctor._id
    }).populate('patientId', 'name email');

    const patientIds = [...new Set(appointments.map(apt => apt.patientId._id.toString()))];
    
    const User = require('../models/User');
    const Patient = require('../models/Patient');
    
    const patients = await User.find({
      _id: { $in: patientIds },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email');

    // Get patient details
    const patientsWithDetails = await Promise.all(
      patients.map(async (user) => {
        const patientDetails = await Patient.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          patientDetails
        };
      })
    );

    res.json(patientsWithDetails);
  } catch (err) {
    console.error('Search patients error:', err);
    res.status(500).json({ message: err.message });
  }
};
/* ================================
   GET MEDICAL RECORDS
   (Doctor)
================================ */
exports.getMedicalRecords = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { patientId, limit = 50 } = req.query;
    let filter = { doctorId: doctor._id };
    
    if (patientId) {
      filter.patientId = patientId;
    }

    const MedicalRecord = require('../models/MedicalRecord');
    const medicalRecords = await MedicalRecord.find(filter)
      .populate({
        path: 'patientId',
        select: 'name email'
      })
      .populate({
        path: 'appointmentId',
        select: 'date time reason'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(medicalRecords);
  } catch (err) {
    console.error('Get medical records error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DASHBOARD OVERVIEW
   (Doctor)
================================ */
exports.getDashboardOverview = async (req, res) => {
  try {
    // Find the doctor record for this user
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: { $in: ['scheduled', 'booked', 'checked-in'] }
    });

    // Get completed appointments today
    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    // Get total unique patients
    const uniquePatients = await Appointment.distinct('patientId', { doctorId: doctor._id });
    const totalPatients = uniquePatients.length;

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      doctorId: doctor._id
    })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent medical records
    const MedicalRecord = require('../models/MedicalRecord');
    const recentMedicalRecords = await MedicalRecord.find({
      doctorId: doctor._id
    })
      .populate({
        path: 'patientId',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .limit(3);

    // Get recent prescriptions
    const Prescription = require('../models/Prescription');
    const recentPrescriptions = await Prescription.find({
      doctorId: doctor._id
    })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(3);

    const overview = {
      totalPatients,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      recentAppointments,
      recentMedicalRecords,
      recentPrescriptions,
      stats: {
        totalPatients,
        todayAppointments,
        pendingAppointments,
        completedAppointments
      }
    };

    res.json(overview);
  } catch (err) {
    console.error('Get dashboard overview error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET APPOINTMENTS (Alias)
   (Doctor)
================================ */
exports.getAppointments = exports.getDoctorAppointments;