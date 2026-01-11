import { Routes, Route } from 'react-router-dom';
import { PremiumDashboardLayout } from '../components/shared/PremiumDashboardLayout';
import { DoctorOverview } from '../components/doctor/DoctorOverview';
import { DoctorAppointments } from '../components/doctor/DoctorAppointments';
import { PatientRecords } from '../components/doctor/PatientRecords';
import { PrescriptionManager } from '../components/doctor/PrescriptionManager';
import { CreateMedicalRecord } from '../components/doctor/CreateMedicalRecord';
import { DoctorSchedule } from '../components/doctor/DoctorSchedule';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';
import { DoctorProvider } from '../context/DoctorContext';

export function DoctorDashboard() {
  return (
    <DoctorProvider>
      <PremiumDashboardLayout 
        role="doctor" 
        title="Doctor Portal"
        subtitle="Medical Excellence Platform"
      >
        <Routes>
          <Route path="/" element={<DoctorOverview />} />
          <Route path="/appointments" element={<DoctorAppointments />} />
          <Route path="/records" element={<PatientRecords />} />
          <Route path="/prescriptions" element={<PrescriptionManager />} />
          <Route path="/create-record" element={<CreateMedicalRecord />} />
          <Route path="/schedule" element={<DoctorSchedule />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </PremiumDashboardLayout>
    </DoctorProvider>
  );
}
