import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import all context providers
import { AdminProvider } from '../context/AdminContext';
import { DoctorProvider } from '../context/DoctorContext';
import { PatientProvider } from '../context/PatientContext';
import { ReceptionistProvider } from '../context/ReceptionistContext';

// Import shared components
import { PremiumDashboardLayout } from '../components/shared/PremiumDashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { NotFound } from '../components/NotFound';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';

// Import Admin Components
import { AdminOverview } from '../components/admin/AdminOverview';
import { DoctorManagement } from '../components/admin/DoctorManagement';
import { PatientManagement } from '../components/admin/PatientManagement';
import { ReceptionistManagement } from '../components/admin/ReceptionistManagement';
import { AppointmentManagement } from '../components/admin/AppointmentManagement';
import { DepartmentManagement } from '../components/admin/DepartmentManagement';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';

// Import Doctor Components
import { DoctorOverview } from '../components/doctor/DoctorOverview';
import { DoctorAppointments } from '../components/doctor/DoctorAppointments';
import { PatientRecords } from '../components/doctor/PatientRecords';
import { PrescriptionManager } from '../components/doctor/PrescriptionManager';
import { CreateMedicalRecord } from '../components/doctor/CreateMedicalRecord';
import { DoctorSchedule } from '../components/doctor/DoctorSchedule';

// Import Patient Components
import { PatientOverview } from '../components/patient/PatientOverview';
import { BookAppointment } from '../components/patient/BookAppointment';
import { MyAppointments } from '../components/patient/MyAppointments';
import { MyPrescriptions } from '../components/patient/MyPrescriptions';
import { MedicalHistory } from '../components/patient/MedicalHistory';
import { MyBilling } from '../components/patient/MyBilling';
import { PayBills } from '../components/patient/PayBills';

// Import Receptionist Components
import { ReceptionistOverview } from '../components/receptionist/ReceptionistOverview';
import { RegisterPatient } from '../components/receptionist/RegisterPatient';
import { ScheduleAppointment } from '../components/receptionist/ScheduleAppointment';
import { ManageQueue } from '../components/receptionist/ManageQueue';

// Import shared utilities
import { HOSPITAL_BRANDING } from '../config/branding';
import { getRoleDashboardImage, getSmartImage } from '../utils/unsplashImages';

// Icons for navigation
import {
  Home,
  Calendar,
  Users,
  FileText,
  BarChart3,
  UserPlus,
  ClipboardList,
  Clock,
  Shield,
  Stethoscope,
  Heart,
  UserCheck,
  Settings,
  User,
  CreditCard,
  History,
  Activity,
  Building2,
  TrendingUp,
  UserCog,
  List,
  Pill,
  FileSearch,
  CalendarPlus,
  UserX,
  DollarSign
} from 'lucide-react';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  roles: string[];
}

// Comprehensive menu items for all roles
const ALL_MENU_ITEMS: MenuItem[] = [
  // Dashboard/Overview items
  { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
  
  // Admin specific items
  { icon: Users, label: 'Manage Doctors', path: '/dashboard/doctors', roles: ['admin'] },
  { icon: UserCheck, label: 'Manage Patients', path: '/dashboard/patients', roles: ['admin'] },
  { icon: UserCog, label: 'Manage Receptionists', path: '/dashboard/receptionists', roles: ['admin'] },
  { icon: Calendar, label: 'All Appointments', path: '/dashboard/appointments', roles: ['admin'] },
  { icon: Building2, label: 'Departments', path: '/dashboard/departments', roles: ['admin'] },
  { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics', roles: ['admin'] },
  
  // Doctor specific items
  { icon: Calendar, label: 'My Appointments', path: '/dashboard/appointments', roles: ['doctor'] },
  { icon: Users, label: 'Patient Records', path: '/dashboard/records', roles: ['doctor'] },
  { icon: Pill, label: 'Prescriptions', path: '/dashboard/prescriptions', roles: ['doctor'] },
  { icon: FileText, label: 'Create Record', path: '/dashboard/create-record', roles: ['doctor'] },
  { icon: Clock, label: 'My Schedule', path: '/dashboard/schedule', roles: ['doctor'] },
  
  // Patient specific items
  { icon: CalendarPlus, label: 'Book Appointment', path: '/dashboard/book', roles: ['patient'] },
  { icon: Calendar, label: 'My Appointments', path: '/dashboard/appointments', roles: ['patient'] },
  { icon: Pill, label: 'My Prescriptions', path: '/dashboard/prescriptions', roles: ['patient'] },
  { icon: History, label: 'Medical History', path: '/dashboard/history', roles: ['patient'] },
  { icon: CreditCard, label: 'Billing & Payments', path: '/dashboard/billing', roles: ['patient'] },
  { icon: DollarSign, label: 'Pay Bills', path: '/dashboard/pay-bills', roles: ['patient'] },
  
  // Receptionist specific items
  { icon: UserPlus, label: 'Register Patient', path: '/dashboard/register', roles: ['receptionist'] },
  { icon: CalendarPlus, label: 'Schedule Appointment', path: '/dashboard/schedule', roles: ['receptionist'] },
  { icon: List, label: 'Manage Queue', path: '/dashboard/queue', roles: ['receptionist'] },
  { icon: Users, label: 'Patient Records', path: '/dashboard/patients', roles: ['receptionist'] },
  
  // Common items for all roles
  { icon: User, label: 'Profile', path: '/dashboard/profile', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['admin', 'doctor', 'patient', 'receptionist'] }
];

// Role configurations
const ROLE_CONFIGS = {
  admin: {
    icon: Shield,
    title: 'Admin Dashboard',
    subtitle: 'Hospital Management System',
    color: 'from-slate-600 to-blue-700',
    bgColor: 'bg-blue-600',
    accent: 'text-blue-400',
    glassClass: 'glass-card-admin',
    bgImage: getRoleDashboardImage('admin'),
    contextualText: 'Managing healthcare excellence through intelligent administration'
  },
  doctor: {
    icon: Stethoscope,
    title: 'Doctor Portal',
    subtitle: 'Medical Excellence Platform',
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-cyan-600',
    accent: 'text-cyan-400',
    glassClass: 'glass-card-doctor',
    bgImage: getRoleDashboardImage('doctor'),
    contextualText: 'Delivering exceptional patient care with precision and compassion'
  },
  patient: {
    icon: Heart,
    title: 'Patient Portal',
    subtitle: 'Your Health Journey',
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-600',
    accent: 'text-blue-400',
    glassClass: 'glass-card-patient',
    bgImage: getRoleDashboardImage('patient'),
    contextualText: 'Your health journey, supported by advanced healthcare technology'
  },
  receptionist: {
    icon: UserCheck,
    title: 'Receptionist Portal',
    subtitle: 'Front Desk Excellence',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-600',
    accent: 'text-purple-400',
    glassClass: 'glass-card-receptionist',
    bgImage: getRoleDashboardImage('receptionist'),
    contextualText: 'Creating exceptional first impressions and seamless patient experiences'
  }
};

// Context Provider Wrapper Component
const ContextProviderWrapper: React.FC<{ role: string; children: React.ReactNode }> = ({ role, children }) => {
  switch (role) {
    case 'admin':
      return <AdminProvider>{children}</AdminProvider>;
    case 'doctor':
      return <DoctorProvider>{children}</DoctorProvider>;
    case 'patient':
      return <PatientProvider>{children}</PatientProvider>;
    case 'receptionist':
      return <ReceptionistProvider>{children}</ReceptionistProvider>;
    default:
      return <>{children}</>;
  }
};

// Main PremiumDashboard Component
export function PremiumDashboard() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to appropriate role dashboard if accessing root
  useEffect(() => {
    if (location.pathname === '/dashboard' && user?.role) {
      // Stay on /dashboard for all roles - it will show role-specific content
    }
  }, [location.pathname, user?.role, navigate]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role as keyof typeof ROLE_CONFIGS;
  const roleConfig = ROLE_CONFIGS[userRole];

  if (!roleConfig) {
    return <Navigate to="/login" replace />;
  }

  // Filter menu items based on user role
  const menuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(userRole)).map(item => ({
    icon: item.icon,
    label: item.label,
    path: item.path
  }));

  return (
    <ContextProviderWrapper role={userRole}>
      <PremiumDashboardLayout
        role={userRole}
        title={roleConfig.title}
        subtitle={roleConfig.subtitle}
        backgroundImage={roleConfig.bgImage}
        menuItems={menuItems}
      >
        <Routes>
          {/* Dashboard Overview Routes */}
          <Route 
            path="/" 
            element={
              userRole === 'admin' ? <AdminOverview /> :
              userRole === 'doctor' ? <DoctorOverview /> :
              userRole === 'patient' ? <PatientOverview /> :
              userRole === 'receptionist' ? <ReceptionistOverview /> :
              <Navigate to="/login" />
            } 
          />

          {/* Admin Routes */}
          {userRole === 'admin' && (
            <>
              <Route path="/doctors" element={<DoctorManagement />} />
              <Route path="/patients" element={<PatientManagement />} />
              <Route path="/receptionists" element={<ReceptionistManagement />} />
              <Route path="/appointments" element={<AppointmentManagement />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </>
          )}

          {/* Doctor Routes */}
          {userRole === 'doctor' && (
            <>
              <Route path="/appointments" element={<DoctorAppointments />} />
              <Route path="/records" element={<PatientRecords />} />
              <Route path="/prescriptions" element={<PrescriptionManager />} />
              <Route path="/create-record" element={<CreateMedicalRecord />} />
              <Route path="/schedule" element={<DoctorSchedule />} />
            </>
          )}

          {/* Patient Routes */}
          {userRole === 'patient' && (
            <>
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/appointments" element={<MyAppointments />} />
              <Route path="/prescriptions" element={<MyPrescriptions />} />
              <Route path="/history" element={<MedicalHistory />} />
              <Route path="/billing" element={<MyBilling />} />
              <Route path="/pay-bills" element={<PayBills />} />
            </>
          )}

          {/* Receptionist Routes */}
          {userRole === 'receptionist' && (
            <>
              <Route path="/register" element={<RegisterPatient />} />
              <Route path="/schedule" element={<ScheduleAppointment />} />
              <Route path="/queue" element={<ManageQueue />} />
              <Route path="/patients" element={<PatientManagement />} />
            </>
          )}

          {/* Common Routes for all roles */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PremiumDashboardLayout>
    </ContextProviderWrapper>
  );
}

// Enhanced Dashboard with Role-Based Access Control
export function EnhancedPremiumDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'receptionist']}>
      <PremiumDashboard />
    </ProtectedRoute>
  );
}

export default PremiumDashboard;