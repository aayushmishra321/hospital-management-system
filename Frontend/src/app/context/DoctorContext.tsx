import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

interface DoctorContextType {
  appointments: any[];
  prescriptions: any[];
  medicalRecords: any[];
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setPrescriptions: React.Dispatch<React.SetStateAction<any[]>>;
  setMedicalRecords: React.Dispatch<React.SetStateAction<any[]>>;
  completeAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, date: string, time: string) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  checkinPatient: (id: string) => Promise<void>;
  addPrescription: (data: any) => Promise<void>;
  updatePrescription: (id: string, data: any) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  addMedicalRecord: (data: any) => Promise<void>;
  updateMedicalRecord: (id: string, data: any) => Promise<void>;
  searchPatients: (query: string) => Promise<any[]>;
  loading: boolean;
}

export const DoctorContext = createContext<DoctorContextType | null>(null);

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const [appointmentsRes, prescriptionsRes, medicalRecordsRes] = await Promise.all([
          api.get('/doctor/appointments'),
          api.get('/doctor/prescriptions'),
          api.get('/doctor/medical-records')
        ]);

        setAppointments(appointmentsRes.data);
        setPrescriptions(prescriptionsRes.data);
        setMedicalRecords(medicalRecordsRes.data);
      } catch (error) {
        console.error('Doctor data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  /* ================================
     COMPLETE APPOINTMENT
  ================================ */
  const completeAppointment = async (id: string) => {
    try {
      const res = await api.put(`/doctor/appointments/${id}/complete`);
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data : apt)
      );
    } catch (error) {
      console.error('Failed to complete appointment', error);
      throw error;
    }
  };

  /* ================================
     ADD PRESCRIPTION
  ================================ */
  const addPrescription = async (data: any) => {
    try {
      const res = await api.post('/doctor/prescriptions', data);
      setPrescriptions(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add prescription', error);
      throw error;
    }
  };

  /* ================================
     ADD MEDICAL RECORD
  ================================ */
  const addMedicalRecord = async (data: any) => {
    try {
      const res = await api.post('/medical-records', data);
      setMedicalRecords(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add medical record', error);
      throw error;
    }
  };

  /* ================================
     RESCHEDULE APPOINTMENT
  ================================ */
  const rescheduleAppointment = async (id: string, date: string, time: string) => {
    try {
      const res = await api.put(`/doctor/appointments/${id}/reschedule`, { date, time });
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data : apt)
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
      const res = await api.put(`/doctor/appointments/${id}/cancel`, { reason });
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data : apt)
      );
    } catch (error) {
      console.error('Failed to cancel appointment', error);
      throw error;
    }
  };

  /* ================================
     CHECK-IN PATIENT
  ================================ */
  const checkinPatient = async (id: string) => {
    try {
      const res = await api.put(`/doctor/appointments/${id}/checkin`);
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data : apt)
      );
    } catch (error) {
      console.error('Failed to check-in patient', error);
      throw error;
    }
  };

  /* ================================
     UPDATE PRESCRIPTION
  ================================ */
  const updatePrescription = async (id: string, data: any) => {
    try {
      const res = await api.put(`/doctor/prescriptions/${id}`, data);
      setPrescriptions(prev => 
        prev.map(prescription => prescription._id === id ? res.data : prescription)
      );
    } catch (error) {
      console.error('Failed to update prescription', error);
      throw error;
    }
  };

  /* ================================
     DELETE PRESCRIPTION
  ================================ */
  const deletePrescription = async (id: string) => {
    try {
      await api.delete(`/doctor/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(prescription => prescription._id !== id));
    } catch (error) {
      console.error('Failed to delete prescription', error);
      throw error;
    }
  };

  /* ================================
     UPDATE MEDICAL RECORD
  ================================ */
  const updateMedicalRecord = async (id: string, data: any) => {
    try {
      const res = await api.put(`/medical-records/${id}`, data);
      setMedicalRecords(prev => 
        prev.map(record => record._id === id ? res.data : record)
      );
    } catch (error) {
      console.error('Failed to update medical record', error);
      throw error;
    }
  };

  /* ================================
     SEARCH PATIENTS
  ================================ */
  const searchPatients = async (query: string) => {
    try {
      const res = await api.get(`/doctor/patients/search?q=${query}`);
      return res.data;
    } catch (error) {
      console.error('Failed to search patients', error);
      throw error;
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        appointments,
        prescriptions,
        medicalRecords,
        setAppointments,
        setPrescriptions,
        setMedicalRecords,
        completeAppointment,
        rescheduleAppointment,
        cancelAppointment,
        checkinPatient,
        addPrescription,
        updatePrescription,
        deletePrescription,
        addMedicalRecord,
        updateMedicalRecord,
        searchPatients,
        loading
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}
