require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const emailService = require('./src/services/emailService');

async function createHospitalAdmin() {
  try {
    console.log('🏥 Creating Hospital Admin Account...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Admin details
    const adminData = {
      name: 'Hospital Administrator',
      email: 'admin@hospital.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true
    };
    
    console.log('\n👤 Admin Account Details:');
    console.log('   Name:', adminData.name);
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('   Role:', adminData.role);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { role: 'admin' }
      ]
    });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin account already exists!');
      console.log('   Existing Admin:', existingAdmin.name);
      console.log('   Email:', existingAdmin.email);
      console.log('   Created:', existingAdmin.createdAt);
      
      // Ask if we should create another admin or update existing
      console.log('\n🔄 Updating existing admin account...');
      
      // Update password and ensure active status
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      existingAdmin.name = adminData.name;
      existingAdmin.lastLogin = null; // Reset last login
      
      await existingAdmin.save();
      
      console.log('✅ Admin account updated successfully!');
      console.log('\n🔑 Login Credentials:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Password:', adminData.password);
      console.log('   Role:', existingAdmin.role);
      
      return existingAdmin;
    }
    
    // Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isActive: adminData.isActive
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', adminUser._id);
    console.log('   Created at:', adminUser.createdAt);
    
    // Send welcome email to admin
    console.log('\n📧 Sending welcome email...');
    try {
      await emailService.sendEmail(
        adminUser.email,
        'Welcome to Hospital Management System - Admin Account Created',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🏥 Welcome to Hospital Management System</h2>
          
          <p>Dear ${adminUser.name},</p>
          
          <p>Your administrator account has been successfully created for <strong>${process.env.HOSPITAL_NAME || 'Hospital Management System'}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🔑 Login Credentials</h3>
            <p><strong>Email:</strong> ${adminUser.email}</p>
            <p><strong>Password:</strong> ${adminData.password}</p>
            <p><strong>Role:</strong> Administrator</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">🔒 Security Notice</h4>
            <p style="color: #92400e; margin-bottom: 0;">Please change your password after your first login for security purposes.</p>
          </div>
          
          <h3 style="color: #1f2937;">🎯 Admin Capabilities</h3>
          <ul>
            <li>👥 Manage all users (patients, doctors, receptionists)</li>
            <li>🏥 Manage hospital departments and services</li>
            <li>📊 View comprehensive analytics and reports</li>
            <li>💰 Manage billing and financial records</li>
            <li>⚙️ Configure system settings</li>
            <li>🔐 Manage user permissions and access</li>
            <li>📋 Oversee all hospital operations</li>
          </ul>
          
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0277bd; margin-top: 0;">🚀 Getting Started</h4>
            <ol style="color: #0277bd;">
              <li>Login to the admin dashboard</li>
              <li>Review and update hospital settings</li>
              <li>Set up departments and services</li>
              <li>Add doctors and staff members</li>
              <li>Configure notification preferences</li>
            </ol>
          </div>
          
          <p>If you have any questions or need assistance, please contact the system administrator.</p>
          
          <p>Best regards,<br>
          <strong>${process.env.HOSPITAL_NAME || 'Hospital Management System'}</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
        `
      );
      console.log('✅ Welcome email sent successfully!');
    } catch (emailError) {
      console.log('⚠️  Welcome email failed:', emailError.message);
      console.log('   (Admin account created successfully, email notification failed)');
    }
    
    // Test admin login
    console.log('\n🧪 Testing admin login...');
    const loginTest = await bcrypt.compare(adminData.password, adminUser.password);
    console.log('   Password verification:', loginTest ? '✅ Success' : '❌ Failed');
    
    // Display summary
    console.log('\n🎉 Hospital Admin Account Created Successfully!');
    console.log('\n📋 Account Summary:');
    console.log('   👤 Name:', adminUser.name);
    console.log('   📧 Email:', adminUser.email);
    console.log('   🔑 Password:', adminData.password);
    console.log('   🏷️  Role:', adminUser.role);
    console.log('   🆔 User ID:', adminUser._id);
    console.log('   ✅ Status: Active');
    console.log('   📅 Created:', adminUser.createdAt.toLocaleString());
    
    console.log('\n🔐 Login Instructions:');
    console.log('   1. Go to the hospital management system login page');
    console.log('   2. Enter email: admin@hospital.com');
    console.log('   3. Enter password: Admin@123456');
    console.log('   4. Select role: Administrator');
    console.log('   5. Click Login');
    
    console.log('\n⚠️  Security Recommendations:');
    console.log('   • Change the default password after first login');
    console.log('   • Enable two-factor authentication if available');
    console.log('   • Regularly review user access and permissions');
    console.log('   • Monitor admin activity logs');
    
    console.log('\n🏥 Admin Dashboard Features:');
    console.log('   • User Management (Patients, Doctors, Staff)');
    console.log('   • Department & Service Management');
    console.log('   • Financial & Billing Oversight');
    console.log('   • System Analytics & Reports');
    console.log('   • Configuration & Settings');
    console.log('   • Audit Logs & Security');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    
    if (error.code === 11000) {
      console.log('\n💡 Duplicate key error - Admin with this email already exists');
      console.log('   Try using a different email address or update the existing admin');
    }
    
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the admin creation
createHospitalAdmin()
  .then(() => {
    console.log('\n🚀 Admin creation process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin creation process failed:', error.message);
    process.exit(1);
  });