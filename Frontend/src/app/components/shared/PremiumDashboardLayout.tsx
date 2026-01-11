import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Shield,
  Stethoscope,
  Heart,
  UserCheck,
  Home,
  Calendar,
  Users,
  FileText,
  BarChart3,
  UserPlus,
  ClipboardList,
  Clock
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { HOSPITAL_BRANDING } from '../../config/branding';
import { getRoleDashboardImage, getSmartImage } from '../../utils/unsplashImages';
import { NotificationDropdown } from '../NotificationDropdown';
import '../../styles/glassmorphism.css';
import '../../styles/animations.css';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

interface PremiumDashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'doctor' | 'patient' | 'receptionist';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  menuItems?: MenuItem[];
}

export const PremiumDashboardLayout: React.FC<PremiumDashboardLayoutProps> = ({
  children,
  role,
  title,
  subtitle,
  backgroundImage,
  menuItems = []
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Default menu items for each role
  const defaultMenuItems = {
    admin: [
      { icon: Home, label: 'Dashboard', path: '/admin' },
      { icon: Users, label: 'Manage Doctors', path: '/admin/doctors' },
      { icon: UserCheck, label: 'Manage Patients', path: '/admin/patients' },
      { icon: UserPlus, label: 'Manage Receptionists', path: '/admin/receptionists' },
      { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
      { icon: FileText, label: 'Reports', path: '/admin/reports' }
    ],
    doctor: [
      { icon: Home, label: 'Dashboard', path: '/doctor' },
      { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
      { icon: Users, label: 'Patients', path: '/doctor/patients' },
      { icon: FileText, label: 'Medical Records', path: '/doctor/records' },
      { icon: ClipboardList, label: 'Prescriptions', path: '/doctor/prescriptions' },
      { icon: Clock, label: 'Schedule', path: '/doctor/schedule' }
    ],
    patient: [
      { icon: Home, label: 'Dashboard', path: '/patient' },
      { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
      { icon: FileText, label: 'Medical History', path: '/patient/history' },
      { icon: ClipboardList, label: 'Prescriptions', path: '/patient/prescriptions' },
      { icon: BarChart3, label: 'Billing', path: '/patient/billing' }
    ],
    receptionist: [
      { icon: Home, label: 'Dashboard', path: '/receptionist' },
      { icon: UserPlus, label: 'Register Patient', path: '/receptionist/register' },
      { icon: Calendar, label: 'Schedule Appointment', path: '/receptionist/schedule' },
      { icon: ClipboardList, label: 'Manage Queue', path: '/receptionist/queue' },
      { icon: Users, label: 'Patient Records', path: '/receptionist/patients' },
      { icon: BarChart3, label: 'Reports', path: '/receptionist/reports' }
    ]
  };

  const currentMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems[role];

  const roleConfigs = {
    admin: {
      icon: Shield,
      color: 'from-slate-600 to-blue-700',
      bgColor: 'bg-blue-600',
      accent: 'text-blue-400',
      glassClass: 'glass-card-admin',
      bgImage: getRoleDashboardImage('admin'),
      contextualText: 'Managing healthcare excellence through intelligent administration'
    },
    doctor: {
      icon: Stethoscope,
      color: 'from-cyan-500 to-teal-600',
      bgColor: 'bg-cyan-600',
      accent: 'text-cyan-400',
      glassClass: 'glass-card-doctor',
      bgImage: getRoleDashboardImage('doctor'),
      contextualText: 'Delivering exceptional patient care with precision and compassion'
    },
    patient: {
      icon: Heart,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-600',
      accent: 'text-blue-400',
      glassClass: 'glass-card-patient',
      bgImage: getRoleDashboardImage('patient'),
      contextualText: 'Your health journey, supported by advanced healthcare technology'
    },
    receptionist: {
      icon: UserCheck,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-600',
      accent: 'text-purple-400',
      glassClass: 'glass-card-receptionist',
      bgImage: getRoleDashboardImage('receptionist'),
      contextualText: 'Creating exceptional first impressions and seamless patient experiences'
    }
  };

  const config = roleConfigs[role];
  const Icon = config.icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={backgroundImage || config.bgImage}
          alt="Dashboard Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getSmartImage({ role });
          }}
        />
        <div className="contextual-overlay">
          <div className="contextual-text opacity-60">
            {config.contextualText}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-40 glass-card m-4 rounded-2xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 hover-lift">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg`}>
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">
                    {HOSPITAL_BRANDING.shortName}
                  </h1>
                  <p className="text-xs text-white/70">
                    {role.charAt(0).toUpperCase() + role.slice(1)} Portal
                  </p>
                </div>
              </Link>
            </div>

            {/* Page Title */}
            {title && (
              <div className="hidden md:block text-center">
                <h2 className="text-xl font-semibold text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-white/70">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationDropdown className="text-white" />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors hover-lift"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-white/70 capitalize">
                      {role}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-2xl fade-in-up">
                    <div className="p-2">
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-2 border-white/20" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-white"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 glass-card m-4 rounded-2xl transform transition-transform duration-300 ease-in-out lg:mt-20`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-6 px-4 overflow-y-auto">
            <nav className="space-y-2">
              {currentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                               (item.path !== `/${role}` && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover-lift ${
                      isActive
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 transition-colors hover-lift"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-4 lg:ml-72">
        <div className={`${config.glassClass} rounded-2xl min-h-[calc(100vh-120px)] card-enter`}>
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Floating Action Button (Optional) */}
      <button className={`fixed bottom-6 right-6 w-14 h-14 ${config.bgColor} rounded-full shadow-2xl flex items-center justify-center hover-lift z-30`}>
        <Activity className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default PremiumDashboardLayout;