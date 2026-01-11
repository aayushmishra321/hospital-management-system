#!/bin/bash

# Hospital Management System - Frontend Deployment Script

echo "🚀 Deploying Frontend to Vercel..."

# Navigate to frontend directory
cd Frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Frontend deployment complete!"
echo "🔗 Check your Vercel dashboard for the live URL"