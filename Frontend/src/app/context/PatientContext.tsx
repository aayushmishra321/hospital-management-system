import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

interface PatientContextType {
  appointments: any[];
  prescriptions: any[];
  billing: any[];
  medicalRecords: any[];

  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setPrescriptions: React.Dispatch<React.SetStateAction<any[]>>;
  setBilling: React.Dispatch<React.SetStateAction<any[]>>;
  setMedicalRecords: React.Dispatch<React.SetStateAction<any[]>>;

  bookAppointment: (data: any) => Promise<void>;
  rescheduleAppointment: (id: string, data: any) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  checkDoctorAvailability: (doctorId: string, date: string) => Promise<any>;
  requestPrescriptionRefill: (id: string, data: any) => Promise<void>;
  getAppointmentReport: (id: string) => Promise<any>;
  refreshPatientData: () => void;
  loading: boolean;
}

export const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      console.log('Fetching patient data...');
      
      // Debug: Check token and user info
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      const [
        appointmentsRes,
        prescriptionsRes,
        billingRes,
        medicalRecordsRes
      ] = await Promise.all([
        api.get('/patient/appointments'),
        api.get('/patient/prescriptions'),
        api.get('/patient/billing'),
        api.get('/patient/medical-history')
      ]);

      console.log('Patient data loaded:');
      console.log('Appointments:', appointmentsRes.data.length);
      console.log('Prescriptions:', prescriptionsRes.data.length);
      console.log('Billing:', billingRes.data.length);
      console.log('Medical Records:', medicalRecordsRes.data.length);

      // Ensure all data is properly formatted arrays
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setPrescriptions(Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data : []);
      setBilling(Array.isArray(billingRes.data) ? billingRes.data : []);
      setMedicalRecords(Array.isArray(medicalRecordsRes.data) ? medicalRecordsRes.data : []);
    } catch (error) {
      console.error('Patient data fetch failed', error);
      console.error('Error details:', error.response?.data);
      
      // Set empty arrays on error to prevent crashes
      setAppointments([]);
      setPrescriptions([]);
      setBilling([]);
      setMedicalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    
    // Initialize Firebase messaging for push notifications
    const initializeFirebase = async () => {
      try {
        const firebaseService = (await import('../services/firebaseService')).default;
        if (firebaseService.isMessagingSupported()) {
          await firebaseService.initializeMessaging();
          console.log('Firebase messaging initialized successfully');
        } else {
          console.log('Firebase messaging not supported in this browser');
        }
      } catch (error) {
        console.error('Failed to initialize Firebase messaging:', error);
      }
    };

    initializeFirebase();
  }, []);

  // Add a refresh function that can be called from components
  const refreshPatientData = () => {
    setLoading(true);
    fetchPatientData();
  };

  /* ================================
     BOOK APPOINTMENT
  ================================ */
  const bookAppointment = async (data: any) => {
    try {
      const res = await api.post('/patient/appointments', data);
      setAppointments(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to book appointment', error);
      throw error;
    }
  };

  /* ================================
     RESCHEDULE APPOINTMENT
  ================================ */
  const rescheduleAppointment = async (id: string, data: any) => {
    try {
      const res = await api.put(`/patient/appointments/${id}/reschedule`, data);
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data.appointment : apt)
      );
    } catch (error) {
      console.error('Failed to reschedule appointment', error);
      throw error;
    }
  };

  /* ================================
     CANCEL APPOINTMENT
  ================================ */
  const cancelAppointment = async (id: string, reason?: string) => {
    try {
      const res = await api.delete(`/patient/appointments/${id}/cancel`, {
        data: { reason }
      });
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data.appointment : apt)
      );
    } catch (error) {
      console.error('Failed to cancel appointment', error);
      throw error;
    }
  };

  /* ================================
     CHECK DOCTOR AVAILABILITY
  ================================ */
  const checkDoctorAvailability = async (doctorId: string, date: string) => {
    try {
      const res = await api.get(`/patient/doctor-availability?doctorId=${doctorId}&date=${date}`);
      return res.data;
    } catch (error) {
      console.error('Failed to check doctor availability', error);
      throw error;
    }
  };

  /* ================================
     REQUEST PRESCRIPTION REFILL
  ================================ */
  const requestPrescriptionRefill = async (id: string, data: any) => {
    try {
      const res = await api.post(`/patient/prescriptions/${id}/refill`, data);
      return res.data;
    } catch (error) {
      console.error('Failed to request prescription refill', error);
      throw error;
    }
  };

  /* ================================
     GET APPOINTMENT REPORT
  ================================ */
  const getAppointmentReport = async (id: string) => {
    try {
      const res = await api.get(`/patient/appointments/${id}/report`);
      return res.data;
    } catch (error) {
      console.error('Failed to get appointment report', error);
      throw error;
    }
  };

  return (
    <PatientContext.Provider
      value={{
        appointments,
        prescriptions,
        billing,
        medicalRecords,

        setAppointments,
        setPrescriptions,
        setBilling,
        setMedicalRecords,

        bookAppointment,
        rescheduleAppointment,
        cancelAppointment,
        checkDoctorAvailability,
        requestPrescriptionRefill,
        getAppointmentReport,
        refreshPatientData,
        loading
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}
