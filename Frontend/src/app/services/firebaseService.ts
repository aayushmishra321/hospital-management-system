import { requestNotificationPermission, onMessageListener } from '../config/firebase';

class FirebaseService {
  private fcmToken: string | null = null;

  // Initialize Firebase messaging
  async initializeMessaging(): Promise<void> {
    try {
      // Check if messaging is supported in this environment
      if (!this.isMessagingSupported()) {
        console.log('Firebase messaging not supported in this browser');
        return;
      }

      // Request notification permission and get FCM token
      this.fcmToken = await requestNotificationPermission();
      
      if (this.fcmToken) {
        // Send FCM token to backend for storage
        await this.sendTokenToBackend(this.fcmToken);
        
        // Listen for foreground messages
        this.setupMessageListener();
      } else {
        console.log('Could not obtain FCM token');
      }
    } catch (error) {
      console.error('Error initializing Firebase messaging:', error);
      // Don't throw error - just log it and continue
    }
  }

  // Send FCM token to backend
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      const response = await fetch('/api/user/update-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      if (response.ok) {
        console.log('FCM token sent to backend successfully');
      } else {
        console.error('Failed to send FCM token to backend');
      }
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
    }
  }

  // Setup message listener for foreground notifications
  private setupMessageListener(): void {
    onMessageListener()
      .then((payload: any) => {
        console.log('Received foreground message:', payload);
        
        // Show notification
        this.showNotification(payload);
      })
      .catch((error) => {
        console.error('Error listening for messages:', error);
      });
  }

  // Show browser notification
  private showNotification(payload: any): void {
    const { notification, data } = payload;
    
    if (notification) {
      const notificationTitle = notification.title || 'Hospital Management';
      const notificationOptions = {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: data,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      };

      if (Notification.permission === 'granted') {
        const notification = new Notification(notificationTitle, notificationOptions);
        
        notification.onclick = () => {
          // Handle notification click
          window.focus();
          notification.close();
          
          // Navigate to relevant page based on data
          if (data?.type) {
            this.handleNotificationClick(data);
          }
        };
      }
    }
  }

  // Handle notification click actions
  private handleNotificationClick(data: any): void {
    const { type, appointmentId, billingId, prescriptionId } = data;
    
    switch (type) {
      case 'appointment_confirmation':
      case 'appointment_reminder':
        if (appointmentId) {
          window.location.href = `/patient/appointments`;
        }
        break;
      case 'payment_reminder':
        if (billingId) {
          window.location.href = `/patient/billing`;
        }
        break;
      case 'prescription_ready':
        if (prescriptionId) {
          window.location.href = `/patient/prescriptions`;
        }
        break;
      case 'lab_results_ready':
        window.location.href = `/patient/history`;
        break;
      case 'emergency':
        // Handle emergency notifications
        break;
      default:
        // Default action
        break;
    }
  }

  // Get current FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Check if messaging is supported
  isMessagingSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }
}

export default new FirebaseService();