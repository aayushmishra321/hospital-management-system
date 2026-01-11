const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      phone, dateOfBirth, gender, address, pincode,
      bloodGroup, occupation, maritalStatus, emergencyContact, medicalHistory
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    if (role === 'doctor') {
      await Doctor.create({ userId: user._id, consultationFee: 500 });
    }
    
    if (role === 'patient') {
      // Calculate age from dateOfBirth if provided
      let calculatedAge = null;
      if (dateOfBirth) {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      }

      const patientData = { 
        userId: user._id,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        age: calculatedAge,
        address: address || undefined,
        pincode: pincode || undefined,
        occupation: occupation || undefined,
        medicalHistory: medicalHistory ? [medicalHistory] : []
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

      if (emergencyContact) {
        patientData.emergencyContact = {
          name: emergencyContact.name || undefined,
          phone: emergencyContact.phone || emergencyContact,
          relationship: emergencyContact.relationship || undefined
        };
      }

      await Patient.create(patientData);
    }

    res.json({ 
      success: true,
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};
