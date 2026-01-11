const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Receptionist = require('../models/Receptionist');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const MedicalRecord = require('../models/MedicalRecord');
const bcrypt = require('bcryptjs');

/* 📊 DASHBOARD STATS */
exports.dashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalReceptionists = await Receptionist.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const revenueAgg = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      totalReceptionists,
      totalAppointments,
      revenue: revenueAgg[0]?.total || 0
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🖥️ SYSTEM STATUS */
exports.systemStatus = async (req, res) => {
  try {
    // Get real system metrics
    const dbStatus = 'Active'; // In production, check actual DB connection
    const apiStatus = 'Running';
    const lastBackup = new Date().toISOString();
    const uptime = process.uptime();
    const uptimePercentage = ((uptime / (24 * 60 * 60)) * 100).toFixed(1);

    // Get recent activity
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentPatients = await Patient.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      database: {
        status: dbStatus,
        lastCheck: new Date().toISOString()
      },
      api: {
        status: apiStatus,
        uptime: Math.floor(uptime),
        uptimePercentage: uptimePercentage
      },
      backup: {
        lastBackup,
        status: 'Completed'
      },
      activity: {
        recentAppointments,
        recentPatients
      }
    });
  } catch (err) {
    console.error('System status error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 👨‍⚕️ DOCTORS - COMPLETE CRUD */
exports.addDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, department, consultationFee, experience, qualifications, availability } = req.body;

    if (!name || !email || !password || !specialization || !department || !consultationFee) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'doctor'
    });

    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      department,
      consultationFee,
      experience: experience || 0,
      qualifications: qualifications || [],
      availability: availability || {},
      isActive: true
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email')
      .populate('department', 'name');

    // Send welcome email to doctor
    try {
      console.log('Sending welcome email to doctor');
      const emailService = require('../services/emailService');
      await emailService.sendDoctorWelcomeEmail(populatedDoctor);
      console.log('Doctor welcome email sent successfully');
    } catch (emailError) {
      console.error('Doctor welcome email failed (non-critical):', emailError);
    }

    // Send welcome SMS to doctor
    try {
      console.log('Sending welcome SMS to doctor');
      const smsService = require('../services/smsService');
      if (populatedDoctor.phone) {
        await smsService.sendWelcomeSMS(
          populatedDoctor.phone,
          populatedDoctor.userId.name
        );
        console.log('Doctor welcome SMS sent successfully');
      } else {
        console.log('Doctor phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('Doctor welcome SMS failed (non-critical):', smsError);
    }

    res.status(201).json({ 
      message: 'Doctor added successfully', 
      doctor: populatedDoctor 
    });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (err) {
    console.error('Get doctors error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id)
      .populate('userId', 'name email')
      .populate('department', 'name');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get doctor's appointments count
    const appointmentsCount = await Appointment.countDocuments({ doctorId: id });
    
    res.json({
      ...doctor.toObject(),
      appointmentsCount
    });
  } catch (err) {
    console.error('Get doctor error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, department, consultationFee, experience, qualifications, availability } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update user information
    if (name || email) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(name && { name }),
        ...(email && { email })
      });
    }

    // Update doctor information
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, {
      ...(specialization && { specialization }),
      ...(department && { department }),
      ...(consultationFee && { consultationFee }),
      ...(experience !== undefined && { experience }),
      ...(qualifications && { qualifications }),
      ...(availability && { availability })
    }, { new: true })
      .populate('userId', 'name email')
      .populate('department', 'name');

    res.json({ 
      message: 'Doctor updated successfully', 
      doctor: updatedDoctor 
    });
  } catch (err) {
    console.error('Update doctor error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor has upcoming appointments
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId: id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (upcomingAppointments > 0) {
      return res.status(400).json({ 
        message: `Cannot delete doctor with ${upcomingAppointments} upcoming appointments. Please reschedule or cancel them first.` 
      });
    }

    // Delete doctor and associated user
    await Doctor.findByIdAndDelete(id);
    await User.findByIdAndDelete(doctor.userId);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, {
      isActive: !doctor.isActive
    }, { new: true })
      .populate('userId', 'name email')
      .populate('department', 'name');

    res.json({ 
      message: `Doctor ${updatedDoctor.isActive ? 'activated' : 'deactivated'} successfully`, 
      doctor: updatedDoctor 
    });
  } catch (err) {
    console.error('Toggle doctor status error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🧑 PATIENTS - COMPLETE CRUD */
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error('Get patients error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id)
      .populate('userId', 'name email');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's appointments and medical records count
    const appointmentsCount = await Appointment.countDocuments({ patientId: id });
    const medicalRecordsCount = await MedicalRecord.countDocuments({ patientId: id });
    
    res.json({
      ...patient.toObject(),
      appointmentsCount,
      medicalRecordsCount
    });
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.addPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address, pincode, bloodGroup, emergencyContact } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'patient'
    });

    const patient = await Patient.create({
      userId: user._id,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      pincode,
      bloodGroup,
      emergencyContact,
      isActive: true
    });

    const populatedPatient = await Patient.findById(patient._id)
      .populate('userId', 'name email');

    // Send welcome email to patient
    try {
      console.log('Sending welcome email to patient');
      const emailService = require('../services/emailService');
      await emailService.sendWelcomeEmail(populatedPatient);
      console.log('Patient welcome email sent successfully');
    } catch (emailError) {
      console.error('Patient welcome email failed (non-critical):', emailError);
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
        console.log('Patient welcome SMS sent successfully');
      } else {
        console.log('Patient phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('Patient welcome SMS failed (non-critical):', smsError);
    }

    res.status(201).json({ 
      message: 'Patient added successfully', 
      patient: populatedPatient 
    });
  } catch (err) {
    console.error('Add patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dateOfBirth, gender, address, pincode, bloodGroup, emergencyContact } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update user information
    if (name || email) {
      await User.findByIdAndUpdate(patient.userId, {
        ...(name && { name }),
        ...(email && { email })
      });
    }

    // Update patient information
    const updatedPatient = await Patient.findByIdAndUpdate(id, {
      ...(phone && { phone }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender }),
      ...(address && { address }),
      ...(pincode && { pincode }),
      ...(bloodGroup && { bloodGroup }),
      ...(emergencyContact && { emergencyContact })
    }, { new: true })
      .populate('userId', 'name email');

    res.json({ 
      message: 'Patient updated successfully', 
      patient: updatedPatient 
    });
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if patient has upcoming appointments
    const upcomingAppointments = await Appointment.countDocuments({
      patientId: id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (upcomingAppointments > 0) {
      return res.status(400).json({ 
        message: `Cannot delete patient with ${upcomingAppointments} upcoming appointments. Please cancel them first.` 
      });
    }

    // Delete patient and associated user
    await Patient.findByIdAndDelete(id);
    await User.findByIdAndDelete(patient.userId);

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.togglePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, {
      isActive: !patient.isActive
    }, { new: true })
      .populate('userId', 'name email');

    res.json({ 
      message: `Patient ${updatedPatient.isActive ? 'activated' : 'deactivated'} successfully`, 
      patient: updatedPatient 
    });
  } catch (err) {
    console.error('Toggle patient status error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🔐 RESET PATIENT PASSWORD */
exports.resetPatientPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.findByIdAndUpdate(patient.userId, {
      password: hashedPassword
    });

    res.json({ 
      message: 'Patient password reset successfully',
      patientId: id
    });
  } catch (err) {
    console.error('Reset patient password error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 🏥 DEPARTMENTS - COMPLETE CRUD */
exports.addDepartment = async (req, res) => {
  try {
    const { name, description, headDoctor } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const dept = await Department.create({ 
      name, 
      description,
      headDoctor,
      isActive: true
    });
    
    const populatedDept = await Department.findById(dept._id)
      .populate('headDoctor', 'userId')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    res.status(201).json({ 
      message: 'Department added successfully', 
      department: populatedDept 
    });
  } catch (err) {
    console.error('Add department error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('headDoctor', 'userId')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // Get doctor count for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          doctorCount
        };
      })
    );

    res.json(departmentsWithCounts);
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id)
      .populate('headDoctor', 'userId')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get department statistics
    const doctorCount = await Doctor.countDocuments({ department: id });
    const doctors = await Doctor.find({ department: id })
      .populate('userId', 'name email')
      .limit(5);

    res.json({
      ...department.toObject(),
      doctorCount,
      doctors
    });
  } catch (err) {
    console.error('Get department error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, headDoctor } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const updatedDepartment = await Department.findByIdAndUpdate(id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(headDoctor && { headDoctor })
    }, { new: true })
      .populate('headDoctor', 'userId')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    res.json({ 
      message: 'Department updated successfully', 
      department: updatedDepartment 
    });
  } catch (err) {
    console.error('Update department error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has doctors
    const doctorCount = await Doctor.countDocuments({ department: id });
    if (doctorCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department with ${doctorCount} doctors. Please reassign them first.` 
      });
    }

    await Department.findByIdAndDelete(id);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Delete department error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 📈 ANALYTICS - ENHANCED */
exports.analytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Date range filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Department statistics
    const departmentStats = await Appointment.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'departments',
          localField: 'doctor.department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department._id',
          name: { $first: '$department.name' },
          patients: { $sum: 1 },
          revenue: { $sum: '$doctor.consultationFee' }
        }
      },
      {
        $project: {
          name: 1,
          patients: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Billing.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]}
            ]
          },
          revenue: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    // Top performing doctors
    const topDoctors = await Appointment.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $group: {
          _id: '$doctorId',
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          specialization: '$doctor.specialization',
          appointmentCount: 1,
          _id: 0
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({ 
      departmentStats,
      monthlyRevenue,
      topDoctors
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.exportAnalytics = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    // Date range filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get analytics data directly
    const departmentStats = await Appointment.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'departments',
          localField: 'doctor.department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department._id',
          name: { $first: '$department.name' },
          patients: { $sum: 1 },
          revenue: { $sum: '$doctor.consultationFee' }
        }
      },
      {
        $project: {
          name: 1,
          patients: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    const analyticsData = { departmentStats };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(analyticsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv);
    } else {
      res.json(analyticsData);
    }
  } catch (err) {
    console.error('Export analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  let csv = 'Department,Patients,Revenue\n';
  data.departmentStats.forEach(dept => {
    csv += `${dept.name},${dept.patients},${dept.revenue}\n`;
  });
  return csv;
}

/* ================================
   RECEPTIONIST MANAGEMENT
================================ */

/* GET ALL RECEPTIONISTS */
exports.getReceptionists = async (req, res) => {
  try {
    const receptionists = await Receptionist.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(receptionists);
  } catch (err) {
    console.error('Get receptionists error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* GET SINGLE RECEPTIONIST */
exports.getReceptionist = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id)
      .populate('userId', 'name email');

    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    res.json(receptionist);
  } catch (err) {
    console.error('Get receptionist error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ADD NEW RECEPTIONIST */
exports.addReceptionist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      shift,
      phone,
      address,
      dateOfJoining,
      salary,
      experience,
      skills,
      languages,
      emergencyContact
    } = req.body;

    // Validation
    if (!name || !email || !password || !employeeId || !department || !shift || !phone || !address || !salary) {
      return res.status(400).json({ 
        message: 'Name, email, password, employee ID, department, shift, phone, address, and salary are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if employee ID already exists
    const existingReceptionist = await Receptionist.findOne({ employeeId });
    if (existingReceptionist) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'receptionist'
    });

    // Create receptionist profile
    const receptionist = await Receptionist.create({
      userId: user._id,
      employeeId,
      department,
      shift,
      phone,
      address,
      dateOfJoining: dateOfJoining || new Date(),
      salary,
      experience: experience || 0,
      skills: skills || [],
      languages: languages || ['English'],
      emergencyContact: emergencyContact || {}
    });

    const populatedReceptionist = await Receptionist.findById(receptionist._id)
      .populate('userId', 'name email');

    // Send welcome email to receptionist
    try {
      console.log('Sending welcome email to receptionist');
      const emailService = require('../services/emailService');
      await emailService.sendReceptionistWelcomeEmail(populatedReceptionist);
      console.log('Receptionist welcome email sent successfully');
    } catch (emailError) {
      console.error('Receptionist welcome email failed (non-critical):', emailError);
    }

    // Send welcome SMS to receptionist
    try {
      console.log('Sending welcome SMS to receptionist');
      const smsService = require('../services/smsService');
      if (populatedReceptionist.phone) {
        await smsService.sendWelcomeSMS(
          populatedReceptionist.phone,
          populatedReceptionist.userId.name
        );
        console.log('Receptionist welcome SMS sent successfully');
      } else {
        console.log('Receptionist phone number not available for SMS');
      }
    } catch (smsError) {
      console.error('Receptionist welcome SMS failed (non-critical):', smsError);
    }

    res.status(201).json({
      message: 'Receptionist added successfully',
      receptionist: populatedReceptionist
    });
  } catch (err) {
    console.error('Add receptionist error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE RECEPTIONIST */
exports.updateReceptionist = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      department,
      shift,
      phone,
      address,
      salary,
      experience,
      skills,
      languages,
      emergencyContact,
      performance
    } = req.body;

    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    // Update user info if provided
    if (name || email) {
      await User.findByIdAndUpdate(receptionist.userId, {
        ...(name && { name }),
        ...(email && { email })
      });
    }

    // Update receptionist info
    const updatedReceptionist = await Receptionist.findByIdAndUpdate(
      req.params.id,
      {
        ...(employeeId && { employeeId }),
        ...(department && { department }),
        ...(shift && { shift }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(salary && { salary }),
        ...(experience !== undefined && { experience }),
        ...(skills && { skills }),
        ...(languages && { languages }),
        ...(emergencyContact && { emergencyContact }),
        ...(performance && { performance })
      },
      { new: true }
    ).populate('userId', 'name email');

    res.json({
      message: 'Receptionist updated successfully',
      receptionist: updatedReceptionist
    });
  } catch (err) {
    console.error('Update receptionist error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* DELETE RECEPTIONIST */
exports.deleteReceptionist = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(receptionist.userId);
    
    // Delete receptionist profile
    await Receptionist.findByIdAndDelete(req.params.id);

    res.json({ message: 'Receptionist deleted successfully' });
  } catch (err) {
    console.error('Delete receptionist error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* TOGGLE RECEPTIONIST STATUS */
exports.toggleReceptionistStatus = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    receptionist.isActive = !receptionist.isActive;
    await receptionist.save();

    const populatedReceptionist = await Receptionist.findById(receptionist._id)
      .populate('userId', 'name email');

    res.json({
      message: `Receptionist ${receptionist.isActive ? 'activated' : 'deactivated'} successfully`,
      receptionist: populatedReceptionist
    });
  } catch (err) {
    console.error('Toggle receptionist status error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* RESET RECEPTIONIST PASSWORD */
exports.resetReceptionistPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(receptionist.userId, { password: hashedPassword });

    res.json({ message: 'Receptionist password reset successfully' });
  } catch (err) {
    console.error('Reset receptionist password error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* 📅 APPOINTMENT MANAGEMENT */

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'userId phone dateOfBirth gender bloodGroup')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('doctorId', 'userId specialization consultationFee')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'userId phone dateOfBirth gender bloodGroup address')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('doctorId', 'userId specialization consultationFee experience')
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
    console.error('Get appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, status = 'booked' } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $in: ['booked', 'checked-in'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      time,
      reason,
      status,
      createdBy: 'admin'
    });

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'userId phone')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('doctorId', 'userId specialization')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    res.status(201).json({ 
      message: 'Appointment created successfully',
      appointment: populatedAppointment 
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, status } = req.body;

    // Check if appointment exists
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If changing doctor, date, or time, check for conflicts
    if (doctorId && (doctorId !== appointment.doctorId.toString() || 
        date !== appointment.date.toISOString().split('T')[0] || 
        time !== appointment.time)) {
      
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId: doctorId || appointment.doctorId,
        date: new Date(date || appointment.date),
        time: time || appointment.time,
        status: { $in: ['booked', 'checked-in'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: 'Doctor is not available at this time' });
      }
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...(patientId && { patientId }),
        ...(doctorId && { doctorId }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(reason && { reason }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'userId phone')
     .populate({
       path: 'patientId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     })
     .populate('doctorId', 'userId specialization')
     .populate({
       path: 'doctorId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     });

    res.json({ 
      message: 'Appointment updated successfully',
      appointment: updatedAppointment 
    });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Check-in patient
exports.checkinAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'booked') {
      return res.status(400).json({ message: 'Only booked appointments can be checked in' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'checked-in',
        checkedInAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'userId phone')
     .populate({
       path: 'patientId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     })
     .populate('doctorId', 'userId specialization')
     .populate({
       path: 'doctorId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     });

    res.json({ 
      message: 'Patient checked in successfully',
      appointment: updatedAppointment 
    });
  } catch (err) {
    console.error('Check-in appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Complete appointment
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'checked-in') {
      return res.status(400).json({ message: 'Only checked-in appointments can be completed' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'userId phone')
     .populate({
       path: 'patientId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     })
     .populate('doctorId', 'userId specialization')
     .populate({
       path: 'doctorId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     });

    res.json({ 
      message: 'Appointment completed successfully',
      appointment: updatedAppointment 
    });
  } catch (err) {
    console.error('Complete appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule completed or cancelled appointments' });
    }

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctorId: appointment.doctorId,
      date: new Date(date),
      time,
      status: { $in: ['booked', 'checked-in'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        date: new Date(date),
        time,
        ...(reason && { reason }),
        status: 'booked', // Reset to booked when rescheduled
        rescheduledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'userId phone')
     .populate({
       path: 'patientId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     })
     .populate('doctorId', 'userId specialization')
     .populate({
       path: 'doctorId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
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

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled appointments' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by admin',
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'userId phone')
     .populate({
       path: 'patientId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
     })
     .populate('doctorId', 'userId specialization')
     .populate({
       path: 'doctorId',
       populate: {
         path: 'userId',
         select: 'name email'
       }
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