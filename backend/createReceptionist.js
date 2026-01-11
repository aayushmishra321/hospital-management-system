require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createReceptionist = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if receptionist user already exists
    const receptionistExists = await User.findOne({ email: 'receptionist@hospital.com' });
    
    if (receptionistExists) {
      console.log('ℹ️ Receptionist user already exists');
      console.log('✅ Receptionist credentials: receptionist@hospital.com / receptionist123');
      process.exit(0);
    }

    // Create receptionist user
    const hashedPassword = await bcrypt.hash('receptionist123', 10);
    await User.create({
      name: 'Sarah Johnson',
      email: 'receptionist@hospital.com',
      password: hashedPassword,
      role: 'receptionist'
    });

    console.log('✅ Receptionist user created: receptionist@hospital.com / receptionist123');
    console.log('🎉 Receptionist setup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Receptionist setup failed:', error);
    process.exit(1);
  }
};

createReceptionist();