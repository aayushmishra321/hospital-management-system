# 🚀 Production Deployment Guide - Vercel + Render

## 🎯 **Problem: Localhost API Calls in Production**

When you deploy a frontend to Vercel, it can no longer access `localhost:5001` because:
- **Localhost is relative** to the server running the code
- **Vercel servers** don't have your backend running on localhost
- **Network isolation** prevents access to your local machine
- **Production environment** needs absolute URLs to external services

## ✅ **Solution: Environment-Based API Configuration**

### **1. Vercel Environment Variables Setup**

In your Vercel dashboard, add these environment variables:

```bash
# CRITICAL: API Base URL (replace with your Render URL)
VITE_API_BASE_URL = https://hospital-backend-zvjt.onrender.com/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51RQKzBFjky9wHK6tca2NxUZxKxrI2mpH9isbU23Kvi4jQfAA2x4cmrCpXD7tAhpbORyansnFbpjMH1tLDg3SCrbB00bEuXQUZp

# Firebase Configuration
VITE_FIREBASE_API_KEY = AIzaSyDLbBhqTr3MJl9NS6Sg4zOVXneFe_domds
VITE_FIREBASE_AUTH_DOMAIN = hospitalmanagement-fa34d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = hospitalmanagement-fa34d
VITE_FIREBASE_STORAGE_BUCKET = hospitalmanagement-fa34d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 378382927258
VITE_FIREBASE_APP_ID = 1:378382927258:web:8e2b17c2262bf383a52623

# App Configuration
VITE_APP_NAME = Hospital Management System
VITE_APP_VERSION = 1.0.0
```

### **2. How to Add Environment Variables in Vercel**

1. **Go to Vercel Dashboard** → Your Project
2. **Click "Settings"** tab
3. **Click "Environment Variables"** in sidebar
4. **Add each variable:**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://hospital-backend-zvjt.onrender.com/api`
   - Environment: **Production** ✓
5. **Click "Save"**
6. **Redeploy** your project

### **3. Correct Axios Configuration**

```typescript
// ✅ CORRECT: Environment-based API configuration
const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envApiUrl) {
    return envApiUrl; // Production: https://your-backend.onrender.com/api
  }
  
  // Development fallback
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

### **4. Example API Calls**

```typescript
// ✅ These will work in production
const fetchDoctors = async () => {
  const response = await api.get('/admin/doctors');
  return response.data;
};

const createAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

// ❌ NEVER do this in production
const badExample = async () => {
  const response = await fetch('http://localhost:5001/api/doctors');
  // This will fail in production!
};
```

### **5. CORS Configuration for Express Backend**

```javascript
// ✅ Production-ready CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5174', // Development
      'https://your-app.vercel.app', // Production
    ];
    
    // Allow any Vercel domain
    const isVercelDomain = origin?.includes('.vercel.app');
    const isAllowed = allowedOrigins.includes(origin) || isVercelDomain;
    
    if (!origin || isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## 🔧 **Deployment Steps**

### **Step 1: Update Environment Variables**
1. Add `VITE_API_BASE_URL` in Vercel dashboard
2. Set value to your Render backend URL
3. Save and redeploy

### **Step 2: Verify Configuration**
1. Check browser console for API URL logs
2. Verify network requests go to Render, not localhost
3. Test CRUD operations

### **Step 3: Test Production**
1. Login to your deployed app
2. Try creating/viewing/editing data
3. Check for CORS errors in console

## 🚨 **Common Issues & Solutions**

### **Issue 1: Still seeing localhost calls**
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add `VITE_API_BASE_URL` in Vercel dashboard

### **Issue 2: CORS errors**
- **Cause**: Backend doesn't allow Vercel domain
- **Solution**: Update CORS configuration in backend

### **Issue 3: Network timeout**
- **Cause**: Render backend is sleeping (free tier)
- **Solution**: Make a health check call to wake it up

### **Issue 4: Environment variables not loading**
- **Cause**: Wrong variable names or Vite prefix missing
- **Solution**: Ensure variables start with `VITE_`

## ✅ **Verification Checklist**

- [ ] Environment variables added in Vercel dashboard
- [ ] `VITE_API_BASE_URL` points to Render backend
- [ ] Backend CORS allows Vercel domain
- [ ] No localhost URLs in production network tab
- [ ] API calls return data successfully
- [ ] CRUD operations work end-to-end

## 🎯 **Expected Results**

**Before Fix:**
```
❌ GET http://localhost:5001/api/doctors (ERR_CONNECTION_REFUSED)
❌ Network Error: Cannot connect to localhost
```

**After Fix:**
```
✅ GET https://hospital-backend-zvjt.onrender.com/api/doctors (200 OK)
✅ API calls work in production
```

---

**🎉 Your application will now work perfectly in production!**