import { Routes, Route } from 'react-router-dom';
import { PremiumDashboardLayout } from '../components/shared/PremiumDashboardLayout';
import { PatientOverview } from '../components/patient/PatientOverview';
import { BookAppointment } from '../components/patient/BookAppointment';
import { MyAppointments } from '../components/patient/MyAppointments';
import { MyPrescriptions } from '../components/patient/MyPrescriptions';
import { MedicalHistory } from '../components/patient/MedicalHistory';
import { MyBilling } from '../components/patient/MyBilling';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';
import { PatientProvider } from '../context/PatientContext';

export function PatientDashboard() {
  return (
    <PatientProvider>
      <PremiumDashboardLayout 
        role="patient" 
        title="Patient Portal"
        subtitle="Your Health Journey"
      >
        <Routes>
          <Route path="/" element={<PatientOverview />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/prescriptions" element={<MyPrescriptions />} />
          <Route path="/history" element={<MedicalHistory />} />
          <Route path="/billing" element={<MyBilling />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </PremiumDashboardLayout>
    </PatientProvider>
  );
}
