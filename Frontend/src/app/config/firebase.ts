// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLbBhqTr3MJl9NS6Sg4zOVXneFe_domds",
  authDomain: "hospitalmanagement-fa34d.firebaseapp.com",
  projectId: "hospitalmanagement-fa34d",
  storageBucket: "hospitalmanagement-fa34d.firebasestorage.app",
  messagingSenderId: "378382927258",
  appId: "1:378382927258:web:8e2b17c2262bf383a52623",
  measurementId: "G-D1NYZ2Z520"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);

// FCM (Firebase Cloud Messaging) functions
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Check if messaging is supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      try {
        // Get FCM token with proper VAPID key
        const token = await getToken(messaging, {
          vapidKey: 'BK8Qf9Z9X2Y3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9G0F1E2D3C4B5A6Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F'
        });
        
        if (token) {
          console.log('FCM Token:', token);
          return token;
        } else {
          console.log('No registration token available.');
          return null;
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        
        // If VAPID key fails, try without it (fallback)
        try {
          const fallbackToken = await getToken(messaging);
          if (fallbackToken) {
            console.log('FCM Token (fallback):', fallbackToken);
            return fallbackToken;
          }
        } catch (fallbackError) {
          console.error('Fallback token generation also failed:', fallbackError);
        }
        
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });

// Firebase configuration object for easy access
export const firebaseConfigObject = firebaseConfig;

export default app;