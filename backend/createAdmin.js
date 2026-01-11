const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('🔗 Connected to MongoDB');

    // Admin credentials
    const adminData = {
      email: 'admin@hospital.com',
      password: 'Admin@2024!',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    };

    // Check if admin already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create User record
    const user = new User({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isActive: true,
      emailVerified: true
    });

    await user.save();
    console.log('✅ Admin user created successfully');

    // Create Admin profile
    const admin = new Admin({
      userId: user._id,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      permissions: [
        'user_management',
        'doctor_management', 
        'patient_management',
        'receptionist_management',
        'appointment_management',
        'billing_management',
        'system_settings',
        'audit_logs',
        'analytics'
      ],
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin profile created successfully');

    console.log('\n🎉 Admin account setup complete!');
    console.log('📧 Email: admin@hospital.com');
    console.log('🔒 Password: Admin@2024!');
    console.log('\n⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the admin creation
createAdminUser();