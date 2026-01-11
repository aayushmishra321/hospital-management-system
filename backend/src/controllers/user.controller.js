const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const UserSettings = require('../models/UserSettings');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

/* ================================
   GET USER PROFILE
================================ */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = { user };

    // Get role-specific profile data
    switch (user.role) {
      case 'patient':
        const patient = await Patient.findOne({ userId }).populate('userId', 'name email');
        profileData.profile = patient;
        break;
      case 'doctor':
        const doctor = await Doctor.findOne({ userId })
          .populate('userId', 'name email')
          .populate('department', 'name');
        profileData.profile = doctor;
        break;
      case 'receptionist':
        const receptionist = await Receptionist.findOne({ userId }).populate('userId', 'name email');
        profileData.profile = receptionist;
        break;
      default:
        profileData.profile = null;
    }

    res.json(profileData);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE USER PROFILE
================================ */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profileData } = req.body;

    // Update user basic info
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    // Update role-specific profile data
    if (profileData && user.role !== 'admin') {
      switch (user.role) {
        case 'patient':
          await Patient.findOneAndUpdate({ userId }, profileData, { new: true });
          break;
        case 'doctor':
          await Doctor.findOneAndUpdate({ userId }, profileData, { new: true });
          break;
        case 'receptionist':
          await Receptionist.findOneAndUpdate({ userId }, profileData, { new: true });
          break;
      }
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   CHANGE PASSWORD
================================ */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET USER SETTINGS
================================ */
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let settings = await UserSettings.findOne({ userId });
    
    // Create default settings if none exist
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }

    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE USER SETTINGS
================================ */
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      settingsData,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPLOAD AVATAR
================================ */
// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadAvatar = upload.single('avatar');

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

    res.json({
      message: 'Avatar updated successfully',
      avatarUrl
    });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DELETE ACCOUNT
================================ */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete role-specific profile
    switch (user.role) {
      case 'patient':
        await Patient.findOneAndDelete({ userId });
        break;
      case 'doctor':
        await Doctor.findOneAndDelete({ userId });
        break;
      case 'receptionist':
        await Receptionist.findOneAndDelete({ userId });
        break;
    }

    // Delete user settings
    await UserSettings.findOneAndDelete({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE FCM TOKEN
================================ */
exports.updateFCMToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update FCM token based on user role
    let updated = false;

    switch (user.role) {
      case 'patient':
        await Patient.findOneAndUpdate(
          { userId },
          { fcmToken },
          { new: true }
        );
        updated = true;
        break;
      case 'doctor':
        await Doctor.findOneAndUpdate(
          { userId },
          { fcmToken },
          { new: true }
        );
        updated = true;
        break;
      case 'receptionist':
        await Receptionist.findOneAndUpdate(
          { userId },
          { fcmToken },
          { new: true }
        );
        updated = true;
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    if (updated) {
      res.json({ 
        success: true, 
        message: 'FCM token updated successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update FCM token' 
      });
    }

  } catch (err) {
    console.error('Update FCM token error:', err);
    res.status(500).json({ message: err.message });
  }
};