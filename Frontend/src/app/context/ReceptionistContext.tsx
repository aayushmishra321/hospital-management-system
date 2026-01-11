import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

interface ReceptionistContextType {
  patients: any[];
  appointments: any[];
  doctors: any[];
  loading: boolean;

  setPatients: React.Dispatch<React.SetStateAction<any[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setDoctors: React.Dispatch<React.SetStateAction<any[]>>;

  // Core Functions
  bookAppointment: (data: any) => Promise<void>;
  registerPatient: (data: any) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  
  // New Functions
  checkDoctorAvailability: (doctorId: string, date: string, time: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const ReceptionistContext =
  createContext<ReceptionistContextType | null>(null);

export function ReceptionistProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================================
     FETCH RECEPTIONIST DATA
  ================================ */
  useEffect(() => {
    const fetchReceptionistData = async () => {
      try {
        const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
          api.get('/admin/patients'), // receptionist needs patient list
          api.get('/receptionist/appointments'), // receptionist appointments
          api.get('/doctor/available') // use public doctors endpoint
        ]);

        console.log('Receptionist data loaded:');
        console.log('Patients:', patientsRes.data.length);
        console.log('Appointments:', appointmentsRes.data.length);
        console.log('Doctors:', doctorsRes.data.length);

        setPatients(patientsRes.data);
        setAppointments(appointmentsRes.data);
        setDoctors(doctorsRes.data);
      } catch (error) {
        console.error('Receptionist data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceptionistData();
  }, []);

  /* ================================
     BOOK APPOINTMENT
  ================================ */
  const bookAppointment = async (data: any) => {
    try {
      const res = await api.post('/receptionist/appointments', data);
      setAppointments(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to book appointment', error);
      throw error;
    }
  };

  /* ================================
     REGISTER PATIENT
  ================================ */
  const registerPatient = async (data: any) => {
    try {
      const res = await api.post('/receptionist/patients', data);
      setPatients(prev => [...prev, res.data.patient]);
    } catch (error) {
      console.error('Failed to register patient', error);
      throw error;
    }
  };

  /* ================================
     UPDATE APPOINTMENT STATUS
  ================================ */
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/receptionist/appointments/${id}/status`, { status });
      setAppointments(prev => 
        prev.map(apt => apt._id === id ? res.data : apt)
      );
    } catch (error) {
      console.error('Failed to update appointment status', error);
      throw error;
    }
  };

  /* ================================
     CHECK DOCTOR AVAILABILITY
  ================================ */
  const checkDoctorAvailability = async (doctorId: string, date: string, time: string): Promise<boolean> => {
    try {
      const existingAppointment = appointments.find((apt: any) => 
        apt.doctorId._id === doctorId && 
        apt.date === date && 
        apt.time === time &&
        apt.status !== 'cancelled'
      );
      return !existingAppointment;
    } catch (error) {
      console.error('Failed to check doctor availability', error);
      return false;
    }
  };

  /* ================================
     REFRESH DATA
  ================================ */
  const refreshData = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        api.get('/admin/patients'),
        api.get('/receptionist/appointments'),
        api.get('/doctor/available')
      ]);

      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to refresh data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReceptionistContext.Provider
      value={{
        patients,
        appointments,
        doctors,
        loading,
        setPatients,
        setAppointments,
        setDoctors,
        bookAppointment,
        registerPatient,
        updateAppointmentStatus,
        checkDoctorAvailability,
        refreshData
      }}
    >
      {children}
    </ReceptionistContext.Provider>
  );
}
