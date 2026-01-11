import axios from 'axios';
import { toast } from 'sonner';

// Environment-based API configuration
const getApiBaseUrl = () => {
  // Production environment
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com/api';
  }
  
  // Development environment
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  }
});

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
