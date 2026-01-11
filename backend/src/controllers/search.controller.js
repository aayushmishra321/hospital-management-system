const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Billing = require('../models/Billing');
const Doctor = require('../models/Doctor');

/* ================================
   SEARCH APPOINTMENTS
================================ */
exports.searchAppointments = async (req, res) => {
  try {
    const {
      query,
      dateFrom,
      dateTo,
      status,
      doctor,
      patient,
      department
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { reason: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ];
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Doctor filter
    if (doctor) {
      filter.doctorId = doctor;
    }

    // Patient filter
    if (patient) {
      filter.patientId = patient;
    }

    let appointments = await Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .sort({ date: -1, time: -1 })
      .limit(100);

    // Department filter (after population)
    if (department) {
      appointments = appointments.filter(apt => 
        apt.doctorId?.department?._id?.toString() === department
      );
    }

    res.json({
      results: appointments,
      total: appointments.length,
      filters: req.query
    });
  } catch (err) {
    console.error('Search appointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SEARCH PATIENTS
================================ */
exports.searchPatients = async (req, res) => {
  try {
    const {
      query,
      ageMin,
      ageMax,
      gender,
      bloodGroup,
      dateFrom,
      dateTo
    } = req.query;

    let filter = {};

    // Age range
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = parseInt(ageMin);
      if (ageMax) filter.age.$lte = parseInt(ageMax);
    }

    // Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // Blood group filter
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    let patients = await Patient.find(filter)
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    // Text search (after population)
    if (query) {
      patients = patients.filter(patient => 
        patient.userId?.name?.toLowerCase().includes(query.toLowerCase()) ||
        patient.userId?.email?.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone?.includes(query) ||
        patient.address?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Date range filter (registration date)
    if (dateFrom || dateTo) {
      patients = patients.filter(patient => {
        const createdAt = new Date(patient.userId?.createdAt);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        
        if (from && createdAt < from) return false;
        if (to && createdAt > to) return false;
        return true;
      });
    }

    res.json({
      results: patients,
      total: patients.length,
      filters: req.query
    });
  } catch (err) {
    console.error('Search patients error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SEARCH MEDICAL RECORDS
================================ */
exports.searchMedicalRecords = async (req, res) => {
  try {
    const {
      query,
      dateFrom,
      dateTo,
      doctor,
      patient,
      diagnosis,
      type
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { diagnosis: { $regex: query, $options: 'i' } },
        { symptoms: { $regex: query, $options: 'i' } },
        { treatment: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ];
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Doctor filter
    if (doctor) {
      filter.doctorId = doctor;
    }

    // Patient filter
    if (patient) {
      filter.patientId = patient;
    }

    // Diagnosis filter
    if (diagnosis) {
      filter.diagnosis = { $regex: diagnosis, $options: 'i' };
    }

    // Type filter (if you add type field to medical records)
    if (type) {
      filter.type = type;
    }

    const medicalRecords = await MedicalRecord.find(filter)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      results: medicalRecords,
      total: medicalRecords.length,
      filters: req.query
    });
  } catch (err) {
    console.error('Search medical records error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   SEARCH BILLING
================================ */
exports.searchBilling = async (req, res) => {
  try {
    const {
      query,
      dateFrom,
      dateTo,
      status,
      doctor,
      patient,
      amountMin,
      amountMax,
      type
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Status filter
    if (status) {
      filter.paymentStatus = status;
    }

    // Doctor filter
    if (doctor) {
      filter.doctorId = doctor;
    }

    // Patient filter
    if (patient) {
      filter.patientId = patient;
    }

    // Amount range
    if (amountMin || amountMax) {
      filter.amount = {};
      if (amountMin) filter.amount.$gte = parseFloat(amountMin);
      if (amountMax) filter.amount.$lte = parseFloat(amountMax);
    }

    // Type filter (if you add type field to billing)
    if (type) {
      filter.type = type;
    }

    const billingRecords = await Billing.find(filter)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      results: billingRecords,
      total: billingRecords.length,
      filters: req.query
    });
  } catch (err) {
    console.error('Search billing error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GLOBAL SEARCH
================================ */
exports.globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search across multiple collections
    const [appointments, patients, medicalRecords, billingRecords] = await Promise.all([
      // Appointments
      Appointment.find({
        $or: [
          { reason: { $regex: query, $options: 'i' } },
          { notes: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('patientId', 'name email')
      .populate('doctorId', 'userId')
      .limit(10),

      // Patients
      Patient.find()
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
        .limit(10)
        .then(patients => patients.filter(p => p.userId)),

      // Medical Records
      MedicalRecord.find({
        $or: [
          { diagnosis: { $regex: query, $options: 'i' } },
          { symptoms: { $regex: query, $options: 'i' } },
          { treatment: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('patientId', 'name email')
      .populate('doctorId', 'userId')
      .limit(10),

      // Billing
      Billing.find({
        description: { $regex: query, $options: 'i' }
      })
      .populate('patientId', 'name email')
      .populate('doctorId', 'userId')
      .limit(10)
    ]);

    res.json({
      appointments: appointments.length,
      patients: patients.length,
      medicalRecords: medicalRecords.length,
      billing: billingRecords.length,
      results: {
        appointments,
        patients,
        medicalRecords,
        billing: billingRecords
      }
    });
  } catch (err) {
    console.error('Global search error:', err);
    res.status(500).json({ message: err.message });
  }
};