import axios from 'axios';
import { toast } from 'sonner';

// Environment-based API configuration with multiple fallbacks
const getApiBaseUrl = () => {
  // Debug environment variables
  console.log('🔍 Environment Debug:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   PROD mode:', import.meta.env.PROD);
  console.log('   DEV mode:', import.meta.env.DEV);
  console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('   Global API URL:', (window as any).__HOSPITAL_API_URL__);
  console.log('   Vite defined URL:', (globalThis as any).__HOSPITAL_API_URL__);
  
  // Priority 1: Use VITE_API_URL if available
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Use Vite-defined constant
  if (typeof (globalThis as any).__HOSPITAL_API_URL__ !== 'undefined') {
    console.log('🌐 Using Vite-defined API URL:', (globalThis as any).__HOSPITAL_API_URL__);
    return (globalThis as any).__HOSPITAL_API_URL__;
  }
  
  // Priority 3: Use global variable if set
  if ((window as any).__HOSPITAL_API_URL__) {
    console.log('🌐 Using global API URL:', (window as any).__HOSPITAL_API_URL__);
    return (window as any).__HOSPITAL_API_URL__;
  }
  
  // Priority 4: Check if we're in production by domain
  const isProductionDomain = window.location.hostname.includes('vercel.app') || 
                            window.location.hostname.includes('netlify.app') ||
                            !window.location.hostname.includes('localhost');
  
  if (isProductionDomain) {
    console.log('🌐 Production domain detected, using Render backend');
    return 'https://hospital-backend-zvjt.onrender.com/api';
  }
  
  // Priority 5: Check Vite's PROD flag
  if (import.meta.env.PROD) {
    console.log('🌐 Vite PROD mode, using Render backend');
    return 'https://hospital-backend-zvjt.onrender.com/api';
  }
  
  // Priority 6: Development fallback
  console.log('🌐 Development mode, using localhost');
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🎯 Final API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  }
});

// Additional debug logging
console.log('🚀 Axios instance created with baseURL:', API_BASE_URL);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    // Redirect to login on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
