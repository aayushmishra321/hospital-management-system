const admin = require('firebase-admin');

class FirebaseConfig {
  constructor() {
    this.initialized = false;
    this.app = null;
  }

  initialize() {
    try {
      if (this.initialized) {
        return this.app;
      }

      // Check if Firebase credentials are provided
      if (!process.env.FIREBASE_PROJECT_ID || 
          !process.env.FIREBASE_PRIVATE_KEY || 
          !process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('Firebase credentials not configured. Firebase services will be disabled.');
        return null;
      }

      // Create service account object
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      } else {
        this.app = admin.app();
      }

      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
      return this.app;

    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
      this.initialized = false;
      return null;
    }
  }

  getApp() {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.app;
  }

  getFirestore() {
    const app = this.getApp();
    return app ? admin.firestore() : null;
  }

  getMessaging() {
    const app = this.getApp();
    return app ? admin.messaging() : null;
  }

  getAuth() {
    const app = this.getApp();
    return app ? admin.auth() : null;
  }

  isInitialized() {
    return this.initialized;
  }
}

module.exports = new FirebaseConfig();