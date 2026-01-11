import axios from 'axios';
import { toast } from 'sonner';

// Environment-based API configuration
const getApiBaseUrl = () => {
  // Always use VITE_API_URL if available
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using API URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Production environment fallback
  if (import.meta.env.PROD) {
    console.log('🌐 Production mode: Using Render backend');
    return 'https://hospital-backend-zvjt.onrender.com/api';
  }
  
  // Development environment fallback
  console.log('🌐 Development mode: Using localhost');
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  }
});

// Debug environment variables in production
console.log('🔍 Environment Debug:');
console.log('   PROD mode:', import.meta.env.PROD);
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   Final API URL:', getApiBaseUrl());

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
