import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AdminContext = createContext<any>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [receptionists, setReceptionists] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================================
     FETCH ADMIN DATA FROM BACKEND
  ================================ */
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log('🔄 Fetching admin data...');
        
        const [
          statsRes,
          doctorsRes,
          patientsRes,
          receptionistsRes,
          departmentsRes,
          appointmentsRes
        ] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/doctors'),
          api.get('/admin/patients'),
          api.get('/admin/receptionists'),
          api.get('/admin/departments'),
          api.get('/admin/appointments')
        ]);

        console.log('✅ Admin data loaded:');
        console.log('   Dashboard stats:', statsRes.data);
        console.log('   Doctors:', doctorsRes.data.length);
        console.log('   Patients:', patientsRes.data.length);
        console.log('   Receptionists:', receptionistsRes.data.length);
        console.log('   Departments:', departmentsRes.data.length);
        console.log('   Appointments:', appointmentsRes.data.length);

        setDashboardStats(statsRes.data);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);
        setReceptionists(receptionistsRes.data);
        setDepartments(departmentsRes.data);
        setAppointments(appointmentsRes.data);
        
        // Fetch billing data separately to avoid blocking other data
        try {
          const billingRes = await api.get('/billing');
          setBilling(billingRes.data);
          console.log('   Billing records:', billingRes.data.length);
        } catch (billingError) {
          console.log('⚠️ Billing data not available:', billingError.message);
          setBilling([]);
        }
      } catch (error) {
        console.error('❌ Admin data fetch failed', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  /* ================================
     DOCTOR MANAGEMENT
  ================================ */
  const addDoctor = async (doctorData: any) => {
    try {
      const response = await api.post('/admin/doctors', doctorData);
      setDoctors(prev => [...prev, response.data.doctor]);
      return response.data;
    } catch (error) {
      console.error('Failed to add doctor', error);
      throw error;
    }
  };

  const updateDoctor = async (id: string, doctorData: any) => {
    try {
      const response = await api.put(`/admin/doctors/${id}`, doctorData);
      setDoctors(prev => 
        prev.map(doctor => 
          doctor._id === id ? response.data.doctor : doctor
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update doctor', error);
      throw error;
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors(prev => prev.filter(doctor => doctor._id !== id));
    } catch (error) {
      console.error('Failed to delete doctor', error);
      throw error;
    }
  };

  const toggleDoctorStatus = async (id: string) => {
    try {
      const response = await api.patch(`/admin/doctors/${id}/status`);
      setDoctors(prev => 
        prev.map(doctor => 
          doctor._id === id ? response.data.doctor : doctor
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to toggle doctor status', error);
      throw error;
    }
  };

  /* ================================
     PATIENT MANAGEMENT
  ================================ */
  const addPatient = async (patientData: any) => {
    try {
      const response = await api.post('/admin/patients', patientData);
      setPatients(prev => [...prev, response.data.patient]);
      return response.data;
    } catch (error) {
      console.error('Failed to add patient', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, patientData: any) => {
    try {
      const response = await api.put(`/admin/patients/${id}`, patientData);
      setPatients(prev => 
        prev.map(patient => 
          patient._id === id ? response.data.patient : patient
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update patient', error);
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await api.delete(`/admin/patients/${id}`);
      setPatients(prev => prev.filter(patient => patient._id !== id));
    } catch (error) {
      console.error('Failed to delete patient', error);
      throw error;
    }
  };

  const togglePatientStatus = async (id: string) => {
    try {
      const response = await api.patch(`/admin/patients/${id}/status`);
      setPatients(prev => 
        prev.map(patient => 
          patient._id === id ? response.data.patient : patient
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to toggle patient status', error);
      throw error;
    }
  };

  const resetPatientPassword = async (id: string, newPassword: string) => {
    try {
      const response = await api.patch(`/admin/patients/${id}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Failed to reset patient password', error);
      throw error;
    }
  };

  /* ================================
     DEPARTMENT MANAGEMENT
  ================================ */
  const addDepartment = async (departmentData: any) => {
    try {
      const response = await api.post('/admin/departments', departmentData);
      setDepartments(prev => [...prev, response.data.department]);
      return response.data;
    } catch (error) {
      console.error('Failed to add department', error);
      throw error;
    }
  };

  const updateDepartment = async (id: string, departmentData: any) => {
    try {
      const response = await api.put(`/admin/departments/${id}`, departmentData);
      setDepartments(prev => 
        prev.map(department => 
          department._id === id ? response.data.department : department
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update department', error);
      throw error;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await api.delete(`/admin/departments/${id}`);
      setDepartments(prev => prev.filter(department => department._id !== id));
    } catch (error) {
      console.error('Failed to delete department', error);
      throw error;
    }
  };

  /* ================================
     APPOINTMENT MANAGEMENT
  ================================ */
  const createAppointment = async (appointmentData: any) => {
    try {
      const response = await api.post('/admin/appointments', appointmentData);
      setAppointments(prev => [...prev, response.data.appointment]);
      return response.data;
    } catch (error) {
      console.error('Failed to create appointment', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointmentData: any) => {
    try {
      const response = await api.put(`/admin/appointments/${id}`, appointmentData);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? response.data.appointment : appointment
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update appointment', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await api.delete(`/admin/appointments/${id}`);
      setAppointments(prev => prev.filter(appointment => appointment._id !== id));
    } catch (error) {
      console.error('Failed to delete appointment', error);
      throw error;
    }
  };

  const checkinAppointment = async (id: string) => {
    try {
      const response = await api.patch(`/admin/appointments/${id}/checkin`);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? response.data.appointment : appointment
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check-in appointment', error);
      throw error;
    }
  };

  const completeAppointment = async (id: string) => {
    try {
      const response = await api.patch(`/admin/appointments/${id}/complete`);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? response.data.appointment : appointment
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to complete appointment', error);
      throw error;
    }
  };

  const rescheduleAppointment = async (id: string, appointmentData: any) => {
    try {
      const response = await api.patch(`/admin/appointments/${id}/reschedule`, appointmentData);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? response.data.appointment : appointment
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to reschedule appointment', error);
      throw error;
    }
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    try {
      const response = await api.patch(`/admin/appointments/${id}/cancel`, { reason });
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? response.data.appointment : appointment
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel appointment', error);
      throw error;
    }
  };

  /* ================================
     DATA REFRESH
  ================================ */
  const refreshAdminData = () => {
    setLoading(true);
    // Re-run the useEffect fetch
    window.location.reload();
  };

  /* ================================
     RECEPTIONIST MANAGEMENT
  ================================ */
  const addReceptionist = async (receptionistData: any) => {
    try {
      const response = await api.post('/admin/receptionists', receptionistData);
      setReceptionists(prev => [...prev, response.data.receptionist]);
      return response.data;
    } catch (error) {
      console.error('Failed to add receptionist', error);
      throw error;
    }
  };

  const updateReceptionist = async (id: string, receptionistData: any) => {
    try {
      const response = await api.put(`/admin/receptionists/${id}`, receptionistData);
      setReceptionists(prev => 
        prev.map(receptionist => 
          receptionist._id === id ? response.data.receptionist : receptionist
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update receptionist', error);
      throw error;
    }
  };

  const deleteReceptionist = async (id: string) => {
    try {
      await api.delete(`/admin/receptionists/${id}`);
      setReceptionists(prev => prev.filter(receptionist => receptionist._id !== id));
    } catch (error) {
      console.error('Failed to delete receptionist', error);
      throw error;
    }
  };

  const toggleReceptionistStatus = async (id: string) => {
    try {
      const response = await api.patch(`/admin/receptionists/${id}/status`);
      setReceptionists(prev => 
        prev.map(receptionist => 
          receptionist._id === id ? response.data.receptionist : receptionist
        )
      );
      return response.data;
    } catch (error) {
      console.error('Failed to toggle receptionist status', error);
      throw error;
    }
  };

  const resetReceptionistPassword = async (id: string, newPassword: string) => {
    try {
      const response = await api.patch(`/admin/receptionists/${id}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Failed to reset receptionist password', error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        patients,
        doctors,
        receptionists,
        departments,
        appointments,
        billing,
        dashboardStats,
        loading,

        // setters (still useful after create/update/delete)
        setPatients,
        setDoctors,
        setReceptionists,
        setDepartments,
        setAppointments,
        setBilling,

        // doctor actions
        addDoctor,
        updateDoctor,
        deleteDoctor,
        toggleDoctorStatus,

        // patient actions
        addPatient,
        updatePatient,
        deletePatient,
        togglePatientStatus,
        resetPatientPassword,

        // department actions
        addDepartment,
        updateDepartment,
        deleteDepartment,
        
        // receptionist actions
        addReceptionist,
        updateReceptionist,
        deleteReceptionist,
        toggleReceptionistStatus,
        resetReceptionistPassword,

        // appointment actions
        createAppointment,
        updateAppointment,
        deleteAppointment,
        checkinAppointment,
        completeAppointment,
        rescheduleAppointment,
        cancelAppointment,

        // utility actions
        refreshAdminData
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
