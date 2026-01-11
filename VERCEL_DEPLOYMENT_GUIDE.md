# 🚀 Complete Vercel Deployment Guide

## 🎯 Current Issue: Missing Environment Variables

Your Vercel deployment is failing because `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` are missing.

## ✅ **Step 1: Add ALL Required Environment Variables**

In your Vercel dashboard, add these **10 variables**:

### **API Configuration**
```
VITE_API_URL = https://hospital-backend-zvjt.onrender.com/api
```

### **Stripe Configuration**
```
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51RQKzBFjky9wHK6tca2NxUZxKxrI2mpH9isbU23Kvi4jQfAA2x4cmrCpXD7tAhpbORyansnFbpjMH1tLDg3SCrbB00bEuXQUZp
```

### **Firebase Configuration**
```
VITE_FIREBASE_API_KEY = AIzaSyDLbBhqTr3MJl9NS6Sg4zOVXneFe_domds
VITE_FIREBASE_AUTH_DOMAIN = hospitalmanagement-fa34d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = hospitalmanagement-fa34d
VITE_FIREBASE_STORAGE_BUCKET = hospitalmanagement-fa34d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 378382927258
VITE_FIREBASE_APP_ID = 1:378382927258:web:8e2b17c2262bf383a52623
```

### **App Configuration**
```
VITE_APP_NAME = Hospital Management System
VITE_APP_VERSION = 1.0.0
```

## 🔧 **Step 2: Deploy**

After adding ALL variables:
1. Click **"Deploy"** button in Vercel
2. Wait for build to complete (2-3 minutes)

## ⚠️ **Step 3: Fix Backend (Important!)**

Your backend is returning 503 errors. You need to:

### **Option A: MongoDB Atlas (Recommended)**
1. Go to https://cloud.mongodb.com
2. Create free account
3. Create cluster (M0 Free tier)
4. Get connection string
5. Update Render backend environment:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hospital_db
   ```

### **Option B: Keep Local Database**
1. Install ngrok: `npm install -g ngrok`
2. Expose MongoDB: `ngrok tcp 27017`
3. Update Render backend environment:
   ```
   MONGO_URI = mongodb://0.tcp.ngrok.io:12345/hospital_db
   ```

## 🎯 **Expected Results**

After completing all steps:
- ✅ **Vercel**: Frontend deploys successfully
- ✅ **Render**: Backend connects to database
- ✅ **Application**: Fully functional

## 🚨 **Common Issues & Solutions**

### **Issue 1: "VITE_API_URL references Secret which does not exist"**
- **Solution**: Add `VITE_API_URL` variable in Vercel dashboard

### **Issue 2: "503 Service Unavailable"**
- **Solution**: Fix backend database connection (MongoDB Atlas)

### **Issue 3: "CORS Error"**
- **Solution**: Update backend CORS to allow Vercel domain

## 📞 **Quick Checklist**

Before deployment:
- [ ] All 10 environment variables added to Vercel
- [ ] Backend database connection working
- [ ] CORS configured for Vercel domain
- [ ] All services running without errors

## 🎉 **Success Indicators**

When everything works:
- Vercel build completes without errors
- Frontend loads at your Vercel URL
- Login functionality works
- API calls succeed (no 503 errors)
- All features functional

---

**Next Step**: Add the missing `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` variables in your Vercel dashboard, then click Deploy!