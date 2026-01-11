import axios from 'axios';
import { toast } from 'sonner';

// Production-ready API base URL configuration
const getApiBaseUrl = (): string => {
  // For Vite + React projects, use VITE_API_BASE_URL
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envApiUrl) {
    console.log('✅ Using environment API URL:', envApiUrl);
    return envApiUrl;
  }

  // Fallback: Detect production environment
  const isProduction = import.meta.env.PROD || 
                      (typeof window !== 'undefined' && (
                        window.location.hostname.includes('vercel.app') ||
                        window.location.hostname.includes('netlify.app')
                      ));

  if (isProduction) {
    const productionUrl = 'https://hospital-backend-zvjt.onrender.com/api';
    console.log('✅ Production detected, using:', productionUrl);
    return productionUrl;
  }

  // Development fallback
  const devUrl = 'http://localhost:5001/api';
  console.log('✅ Development mode, using:', devUrl);
  return devUrl;
};

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds for production
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if you need cookies
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls for debugging
    console.log(`🌐 API Call: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error occurred';
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: message,
      baseURL: error.config?.baseURL
    });
    
    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    // Redirect to login on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
