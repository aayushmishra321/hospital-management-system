import { Routes, Route } from 'react-router-dom';
import { PremiumDashboardLayout } from '../components/shared/PremiumDashboardLayout';
import { ReceptionistOverview } from '../components/receptionist/ReceptionistOverview';
import { RegisterPatient } from '../components/receptionist/RegisterPatient';
import { ScheduleAppointment } from '../components/receptionist/ScheduleAppointment';
import { ManageQueue } from '../components/receptionist/ManageQueue';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';
import { ReceptionistProvider } from '../context/ReceptionistContext';

export function ReceptionistDashboard() {
  return (
    <ReceptionistProvider>
      <PremiumDashboardLayout 
        role="receptionist" 
        title="Receptionist Portal"
        subtitle="Front Desk Excellence"
      >
        <Routes>
          <Route path="/" element={<ReceptionistOverview />} />
          <Route path="/register" element={<RegisterPatient />} />
          <Route path="/schedule" element={<ScheduleAppointment />} />
          <Route path="/queue" element={<ManageQueue />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </PremiumDashboardLayout>
    </ReceptionistProvider>
  );
}
