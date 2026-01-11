import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PremiumDashboardLayout } from '../components/shared/PremiumDashboardLayout';

import { AdminOverview } from '../components/admin/AdminOverview';
import { DoctorManagement } from '../components/admin/DoctorManagement';
import { ReceptionistManagement } from '../components/admin/ReceptionistManagement';
import { PatientManagement } from '../components/admin/PatientManagement';
import { AppointmentManagement } from '../components/admin/AppointmentManagement';
import { DepartmentManagement } from '../components/admin/DepartmentManagement';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';

import { AdminProvider } from '../context/AdminContext';

export function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <AdminProvider>
      <PremiumDashboardLayout 
        role="admin" 
        title="Admin Dashboard"
        subtitle="Hospital Management System"
      >
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/receptionists" element={<ReceptionistManagement />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/appointments" element={<AppointmentManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </PremiumDashboardLayout>
    </AdminProvider>
  );
}
