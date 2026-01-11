// 🚀 Production-Ready API Service Examples
import api from './api';

// ✅ CORRECT: All API calls use the configured axios instance
export class ApiService {
  
  // Authentication
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Admin Operations
  static async getDoctors() {
    const response = await api.get('/admin/doctors');
    return response.data;
  }

  static async createDoctor(doctorData: any) {
    const response = await api.post('/admin/doctors', doctorData);
    return response.data;
  }

  static async updateDoctor(id: string, doctorData: any) {
    const response = await api.put(`/admin/doctors/${id}`, doctorData);
    return response.data;
  }

  static async deleteDoctor(id: string) {
    const response = await api.delete(`/admin/doctors/${id}`);
    return response.data;
  }

  // Patient Operations
  static async getPatients() {
    const response = await api.get('/admin/patients');
    return response.data;
  }

  static async getPatientById(id: string) {
    const response = await api.get(`/patient/${id}`);
    return response.data;
  }

  // Appointments
  static async getAppointments() {
    const response = await api.get('/appointments');
    return response.data;
  }

  static async createAppointment(appointmentData: any) {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  }

  static async updateAppointment(id: string, appointmentData: any) {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  }

  // Billing
  static async getBills() {
    const response = await api.get('/billing');
    return response.data;
  }

  static async createBill(billData: any) {
    const response = await api.post('/billing', billData);
    return response.data;
  }

  // System Status
  static async getSystemStatus() {
    const response = await api.get('/admin/system-status');
    return response.data;
  }

  // Health Check
  static async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  }
}

// ❌ NEVER DO THIS - Hardcoded URLs will fail in production
export class BadApiService {
  static async badExample() {
    // This will work in development but FAIL in production
    const response = await fetch('http://localhost:5001/api/doctors');
    return response.json();
  }
}

// ✅ CORRECT: Using environment-aware configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Example usage in components:
/*
import { ApiService } from '../services/apiExamples';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await ApiService.getDoctors();
        setDoctors(data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      {doctors.map(doctor => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
    </div>
  );
};
*/