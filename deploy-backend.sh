#!/bin/bash

# Hospital Management System - Backend Deployment Script

echo "🚀 Preparing Backend for Render Deployment..."

# Navigate to backend directory
cd backend

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Run deployment verification
echo "🔍 Running deployment readiness check..."
npm run verify

# Commit and push to GitHub (Render will auto-deploy)
echo "📤 Pushing to GitHub for Render deployment..."
cd ..
git add .
git commit -m "Backend ready for production deployment"
git push origin main

echo "✅ Backend deployment initiated!"
echo "🔗 Check your Render dashboard for deployment status"