const mongoose = require('mongoose');
const { createNotification } = require('./src/controllers/notification.controller');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/hospital_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createReceptionistNotification() {
  try {
    console.log('🔔 CREATING RECEPTIONIST TEST NOTIFICATIONS');
    console.log('==========================================\n');
    
    // Find receptionist user
    const receptionist = await User.findOne({ email: 'dentalmanagement00@gmail.com' });
    
    if (!receptionist) {
      console.log('❌ Receptionist user not found');
      return;
    }
    
    console.log(`Found receptionist: ${receptionist.name} (${receptionist.email})`);
    
    // Create multiple test notifications
    const notifications = [
      {
        title: 'New Patient Registration',
        message: 'A new patient has been registered and needs appointment scheduling.',
        type: 'appointment',
        priority: 'medium',
        actionUrl: '/receptionist/schedule'
      },
      {
        title: 'Appointment Reminder',
        message: 'Patient John Doe has an appointment in 30 minutes.',
        type: 'reminder',
        priority: 'high',
        actionUrl: '/receptionist/queue'
      },
      {
        title: 'Payment Received',
        message: 'Payment of $150 received from patient Sarah Wilson.',
        type: 'billing',
        priority: 'low',
        actionUrl: '/receptionist/billing'
      },
      {
        title: 'System Alert',
        message: 'Please update patient contact information for better communication.',
        type: 'alert',
        priority: 'urgent',
        actionUrl: '/receptionist/patients'
      },
      {
        title: 'Queue Update',
        message: 'Current queue has 5 patients waiting. Please manage efficiently.',
        type: 'system',
        priority: 'medium',
        actionUrl: '/receptionist/queue'
      }
    ];
    
    for (let i = 0; i < notifications.length; i++) {
      const notifData = notifications[i];
      try {
        const notification = await createNotification(receptionist._id, notifData);
        console.log(`✅ Notification ${i + 1} created: ${notification.title}`);
      } catch (error) {
        console.log(`❌ Failed to create notification ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n🎉 RECEPTIONIST NOTIFICATIONS CREATED!');
    console.log('Now test the notification dropdown in the receptionist dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createReceptionistNotification();