#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this in your Frontend directory after installing Vercel CLI

echo "Setting up Vercel environment variables..."

# Replace with your actual Render backend URL
vercel env add VITE_API_URL production
# When prompted, enter: https://hospital-backend-zvjt.onrender.com/api

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# When prompted, enter: pk_test_51RQKzBFjky9wHK6tca2NxUZxKxrI2mpH9isbU23Kvi4jQfAA2x4cmrCpXD7tAhpbORyansnFbpjMH1tLDg3SCrbB00bEuXQUZp

vercel env add VITE_FIREBASE_API_KEY production
# When prompted, enter: AIzaSyDLbBhqTr3MJl9NS6Sg4zOVXneFe_domds

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# When prompted, enter: hospitalmanagement-fa34d.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# When prompted, enter: hospitalmanagement-fa34d

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# When prompted, enter: hospitalmanagement-fa34d.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# When prompted, enter: 378382927258

vercel env add VITE_FIREBASE_APP_ID production
# When prompted, enter: 1:378382927258:web:8e2b17c2262bf383a52623

vercel env add VITE_APP_NAME production
# When prompted, enter: Hospital Management System

vercel env add VITE_APP_VERSION production
# When prompted, enter: 1.0.0

echo "Environment variables setup complete!"
echo "Now redeploy your project: vercel --prod"