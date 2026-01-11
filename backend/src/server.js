require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const firebaseConfig = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();
connectDB();

// Load all Mongoose models to prevent MissingSchemaError
require('./models');
console.log('✅ All Mongoose models loaded successfully');

// Initialize Firebase 
firebaseConfig.initialize();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174',  // Added for Vite dev server
      'http://localhost:3001',
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/receptionist', require('./routes/receptionist.routes'));
app.use('/api/doctor', require('./routes/doctor.routes'));
app.use('/api/patient', require('./routes/patient.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/medical-records', require('./routes/medicalRecord.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/sms', require('./routes/sms.routes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
