const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

/* ================================
   RATE LIMITING CONFIGURATIONS
================================ */

// General API rate limiter
const generalLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGO_URI, // Fixed: was MONGODB_URI
    collectionName: 'rate_limits',
    expireTimeMs: 15 * 60 * 1000 // 15 minutes
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'auth_rate_limits',
    expireTimeMs: 15 * 60 * 1000
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'password_reset_limits',
    expireTimeMs: 60 * 60 * 1000 // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'upload_rate_limits',
    expireTimeMs: 60 * 60 * 1000 // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 file uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Payment processing rate limiter
const paymentLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'payment_rate_limits',
    expireTimeMs: 60 * 60 * 1000 // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment attempts per hour
  message: {
    error: 'Too many payment attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Search rate limiter
const searchLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'search_rate_limits',
    expireTimeMs: 5 * 60 * 1000 // 5 minutes
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 search requests per 5 minutes
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// SMS/Email notification rate limiter
const notificationLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'notification_rate_limits',
    expireTimeMs: 60 * 60 * 1000 // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 notifications per hour
  message: {
    error: 'Too many notification requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Create account rate limiter
const createAccountLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'create_account_limits',
    expireTimeMs: 24 * 60 * 60 * 1000 // 24 hours
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 account creations per day
  message: {
    error: 'Too many account creation attempts, please try again tomorrow.',
    retryAfter: '24 hours'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/* ================================
   CUSTOM RATE LIMITER FUNCTIONS
================================ */

// User-specific rate limiter (based on user ID)
const createUserRateLimiter = (maxRequests, windowMs, message) => {
  const userLimiters = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();

    if (!userLimiters.has(userId)) {
      userLimiters.set(userId, {
        requests: [],
        resetTime: now + windowMs
      });
    }

    const userLimit = userLimiters.get(userId);

    // Clean old requests
    userLimit.requests = userLimit.requests.filter(time => now - time < windowMs);

    // Check if limit exceeded
    if (userLimit.requests.length >= maxRequests) {
      return res.status(429).json({
        error: message || 'Too many requests',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    // Add current request
    userLimit.requests.push(now);
    userLimiters.set(userId, userLimit);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, value] of userLimiters.entries()) {
        if (now > value.resetTime) {
          userLimiters.delete(key);
        }
      }
    }

    next();
  };
};

// Appointment booking rate limiter (per user)
const appointmentBookingLimiter = createUserRateLimiter(
  10, // 10 appointments
  24 * 60 * 60 * 1000, // per day
  'Too many appointment booking attempts today'
);

// Profile update rate limiter (per user)
const profileUpdateLimiter = createUserRateLimiter(
  20, // 20 updates
  60 * 60 * 1000, // per hour
  'Too many profile updates this hour'
);

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  paymentLimiter,
  searchLimiter,
  notificationLimiter,
  createAccountLimiter,
  appointmentBookingLimiter,
  profileUpdateLimiter,
  createUserRateLimiter
};