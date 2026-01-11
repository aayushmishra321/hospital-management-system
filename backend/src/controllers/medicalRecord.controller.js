const MedicalRecord = require('../models/MedicalRecord');

/* ================================
   CREATE MEDICAL RECORD
   (Doctor)
================================ */
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, treatment, notes, vitals, followUpDate } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: 'Patient ID and diagnosis are required' });
    }

    // Find the doctor record for this user
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId: doctor._id,
      appointmentId,
      diagnosis,
      symptoms: symptoms || [],
      treatment,
      notes,
      vitals,
      followUpDate
    });

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId');

    res.status(201).json(populatedRecord);
  } catch (err) {
    console.error('Create medical record error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET PATIENT MEDICAL RECORDS
   (Patient)
================================ */
exports.getMyMedicalRecords = async (req, res) => {
  try {
    console.log('=== GET MY MEDICAL RECORDS DEBUG ===');
    console.log('User ID from token:', req.user.id);
    
    // First, let's find the patient record for this user
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ userId: req.user.id });
    console.log('Patient record found:', !!patient);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    console.log('Patient ID:', patient._id);
    
    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    console.log('Medical records found for patient:', records.length);
    console.log('Medical records data:', records.map(r => ({
      id: r._id,
      patientId: r.patientId,
      diagnosis: r.diagnosis,
      appointmentId: r.appointmentId,
      createdAt: r.createdAt
    })));

    res.json(records);
  } catch (err) {
    console.error('Get my medical records error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET DOCTOR'S MEDICAL RECORDS
   (Doctor)
================================ */
exports.getDoctorMedicalRecords = async (req, res) => {
  try {
    // Find the doctor record for this user
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const records = await MedicalRecord.find({ doctorId: doctor._id })
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error('Get doctor medical records error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET PATIENT RECORDS BY ID
   (Doctor, Admin)
================================ */
exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const records = await MedicalRecord.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error('Get patient records error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE MEDICAL RECORD
   (Doctor)
================================ */
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Find the doctor record for this user
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Only the doctor who created the record can update it
    if (record.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('patientId', 'name email')
     .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
     .populate('appointmentId');

    res.json(updatedRecord);
  } catch (err) {
    console.error('Update medical record error:', err);
    res.status(500).json({ message: err.message });
  }
};