# 🚀 Hospital Management System - Deployment Guide

## Overview
This guide covers deploying the Hospital Management System with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary/AWS S3
- **Payments**: Stripe
- **Notifications**: Firebase + Twilio

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] MongoDB Atlas cluster created
- [ ] Stripe account configured (test & live keys)
- [ ] Firebase project setup
- [ ] Twilio account setup
- [ ] Email service configured (Gmail/SendGrid)

### 2. Code Preparation
- [ ] All environment variables configured
- [ ] Frontend build tested locally
- [ ] Backend API endpoints tested
- [ ] Database migrations completed
- [ ] Security configurations verified

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Update package.json scripts**:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npm install --production"
  }
}
```

2. **Set production environment variables on Render**:
```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_db
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
CORS_ORIGIN=https://your-frontend-app.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Deploy to Render

1. **Connect GitHub Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend folder

2. **Configure Build Settings**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users

3. **Add Environment Variables**:
   - Copy all environment variables from above
   - Ensure CORS_ORIGIN matches your Vercel domain

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update environment variables**:
```env
# .env.production
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

2. **Create Vercel configuration**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd Frontend
vercel --prod
```

3. **Or use Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Root Directory**: Frontend
     - **Build Command**: `npm run build`
     - **Output Directory**: dist

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster (M0 free tier for testing)
3. Configure network access (0.0.0.0/0 for production)
4. Create database user

### Step 2: Initialize Database
```bash
# Run this script to create initial admin user
node backend/createAdmin.js
```

## 🔐 Security Configuration

### 1. CORS Configuration
```javascript
// backend/src/server.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. Rate Limiting
```javascript
// Already configured in middleware/rateLimiter.middleware.js
```

### 3. Helmet Security Headers
```javascript
// Add to server.js
const helmet = require('helmet');
app.use(helmet());
```

## 📱 Mobile Responsiveness Check

### Responsive Design Verification
```bash
# Test responsive design
npm run test:responsive
```

### Key Breakpoints Tested:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 💳 Payment System Verification

### Stripe Configuration
1. **Test Mode**: Use test keys for development
2. **Live Mode**: Use live keys for production
3. **Webhooks**: Configure webhook endpoints

### Payment Flow Test:
```bash
# Run payment system test
node backend/testPaymentSystem.js
```

## 🔔 Notification System Setup

### Firebase Setup
1. Create Firebase project
2. Enable Cloud Messaging
3. Generate service account key
4. Configure web push certificates

### Twilio Setup
1. Create Twilio account
2. Get phone number
3. Configure SMS templates

## 🧪 Testing All Functionalities

### Run Comprehensive Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd Frontend
npm test

# Integration tests
npm run test:integration
```

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Admin dashboard functionality
- [ ] Doctor appointment management
- [ ] Patient booking system
- [ ] Receptionist queue management
- [ ] Payment processing
- [ ] Notification system
- [ ] Mobile responsiveness
- [ ] File upload/download
- [ ] Email notifications
- [ ] SMS notifications

## 🚀 Deployment Commands

### Backend Deployment
```bash
# 1. Prepare environment
cp .env.production .env

# 2. Install dependencies
npm install --production

# 3. Run pre-deployment check
node preDeploymentCheck.js

# 4. Deploy to Render (automatic via GitHub)
git push origin main
```

### Frontend Deployment
```bash
# 1. Build for production
npm run build

# 2. Test build locally
npm run preview

# 3. Deploy to Vercel
vercel --prod
```

## 🔍 Post-Deployment Verification

### Health Checks
```bash
# Check backend health
curl https://your-backend-app.onrender.com/api/health

# Check frontend
curl https://your-frontend-app.vercel.app
```

### Functionality Tests
1. **Authentication**: Register/login new user
2. **Appointments**: Book and manage appointments
3. **Payments**: Process test payment
4. **Notifications**: Send test notification
5. **File Upload**: Upload test document
6. **Email**: Send test email
7. **SMS**: Send test SMS

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
```javascript
// Ensure CORS_ORIGIN is set correctly
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

#### 2. Environment Variables Not Loading
```bash
# Check environment variables are set
echo $VITE_API_URL
```

#### 3. Database Connection Issues
```javascript
// Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

#### 4. Payment Failures
- Verify Stripe keys are correct
- Check webhook endpoints
- Ensure HTTPS in production

#### 5. File Upload Issues
- Check Cloudinary configuration
- Verify file size limits
- Ensure proper MIME types

### Monitoring and Logs
- **Render**: Check application logs in dashboard
- **Vercel**: Monitor function logs
- **MongoDB Atlas**: Check database metrics
- **Stripe**: Monitor payment dashboard

## 📊 Performance Optimization

### Frontend Optimization
- Code splitting implemented
- Image optimization
- Lazy loading
- Service worker for caching

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Rate limiting

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs weekly
- [ ] Backup database daily
- [ ] Review security settings quarterly
- [ ] Update SSL certificates annually

### Emergency Contacts
- **Hosting**: Render/Vercel support
- **Database**: MongoDB Atlas support
- **Payments**: Stripe support
- **Notifications**: Firebase/Twilio support

---

## 🎉 Deployment Complete!

Your Hospital Management System is now live and ready for production use!

**Frontend URL**: https://your-frontend-app.vercel.app
**Backend URL**: https://your-backend-app.onrender.com
**Admin Panel**: https://your-frontend-app.vercel.app/admin

### Next Steps:
1. Configure domain name (optional)
2. Set up monitoring and alerts
3. Create user documentation
4. Plan regular maintenance schedule
5. Monitor usage and performance metrics

For any issues, refer to the troubleshooting section or contact support.