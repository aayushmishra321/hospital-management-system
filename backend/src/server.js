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

// Production-ready CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Define allowed origins
    const allowedOrigins = [
      // Local development
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://localhost:3001',
      'http://127.0.0.1:5174',
      
      // Your specific Vercel domains
      'https://hospital-management-system-aayushmishra321s-projects.vercel.app',
      'https://hospital-management-system-git-main-aayushmishra321s-projects.vercel.app',
      
      // Environment variables
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Allow any Vercel domain for flexibility
    const isVercelDomain = origin.includes('.vercel.app');
    const isNetlifyDomain = origin.includes('.netlify.app');
    const isAllowedOrigin = allowedOrigins.includes(origin);
    
    if (isAllowedOrigin || isVercelDomain || isNetlifyDomain) {
      console.log('✅ CORS: Origin allowed -', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin blocked -', origin);
      console.log('📋 Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 86400, // Cache preflight response for 24 hours
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/user',
      doctors: '/api/doctor',
      patients: '/api/patient',
      appointments: '/api/appointments',
      billing: '/api/billing',
      payments: '/api/payments'
    }
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    status: 'Running',
    version: '1.0.0',
    documentation: 'Available endpoints listed below',
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'GET /api/user/profile - User profile',
      'GET /api/doctor/appointments - Doctor appointments',
      'GET /api/patient/appointments - Patient appointments',
      'POST /api/billing/create - Create bill',
      'POST /api/payments/create-payment-intent - Create payment'
    ]
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
