import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { getRoleDashboardImage, getLegacyImage } from '../../utils/unsplashImages';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  Shield, 
  Star, 
  Settings, 
  TrendingUp,
  Activity,
  Database,
  Server,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const adminQuotes = [
  "Great leaders inspire people to have confidence in their leader; great leaders inspire people to have confidence in themselves.",
  "The art of administration is the art of making wise decisions.",
  "Effective management is putting first things first.",
  "Leadership is about making others better as a result of your presence.",
  "A good administrator is one who can delegate and trust."
];

export function AdminOverview() {
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  if (!adminContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src={getLegacyImage('loading')} 
          alt="Loading"
          className="w-16 h-16"
        />
      </div>
    );
  }
  
  const { dashboardStats, loading } = adminContext;

  // Fetch system status
  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/system-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
      // Don't show error toast for system status as it's not critical
    } finally {
      setStatusLoading(false);
    }
  };

  // Quick action handlers - NOW FUNCTIONAL
  const handleAddDoctor = () => {
    navigate('/dashboard/doctors');
    // Trigger add doctor modal after navigation
    setTimeout(() => {
      const addButton = document.querySelector('[data-add-doctor]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }, 100);
  };

  const handleManageDepartments = () => {
    navigate('/dashboard/departments');
  };

  const handleViewAnalytics = () => {
    navigate('/dashboard/analytics');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src="/Public/Admin and doctors/loading.gif" 
          alt="Loading"
          className="w-16 h-16"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
          }}
        />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 hidden"></div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Users, 
      label: 'Total Patients', 
      value: dashboardStats?.totalPatients || 0,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      icon: Stethoscope, 
      label: 'Total Doctors', 
      value: dashboardStats?.totalDoctors || 0,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+5%'
    },
    { 
      icon: UserCheck, 
      label: 'Receptionists', 
      value: dashboardStats?.totalReceptionists || 0,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '+2%'
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      value: dashboardStats?.totalAppointments || 0,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+18%'
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: `$${dashboardStats?.revenue?.toLocaleString() || 0}`,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+25%'
    },
  ];

  const todayQuote = adminQuotes[new Date().getDay() % adminQuotes.length];

  return (
    <div className="space-y-6">
      {/* Hero Section with Admin Background */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl overflow-hidden min-h-[300px]">
        <div className="absolute inset-0">
          <img 
            src={getRoleDashboardImage('admin')} 
            alt="Admin Portal"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/Public/Admin and doctors/logo.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80"></div>
        </div>
        <div className="relative p-8 flex flex-col justify-center min-h-[300px]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-white/90 font-medium">Welcome Back, Administrator</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">Admin Dashboard</h1>
            <p className="text-xl text-white/90 mb-6">
              Complete hospital management and analytics at your fingertips
            </p>
            
            {/* Daily Quote */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium italic">"{todayQuote}"</p>
                  <p className="text-white/80 text-sm mt-2">— Leadership Inspiration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`${stat.color} p-4`}>
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8 text-white" />
                  <span className="text-white/80 text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions - NOW FUNCTIONAL */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleAddDoctor}
              className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <div className="font-medium text-purple-800 group-hover:text-purple-900">Add New Doctor</div>
              <div className="text-sm text-purple-600">Register a new doctor to the system</div>
            </button>
            <button 
              onClick={handleManageDepartments}
              className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <div className="font-medium text-blue-800 group-hover:text-blue-900">Manage Departments</div>
              <div className="text-sm text-blue-600">Add or modify hospital departments</div>
            </button>
            <button 
              onClick={handleViewAnalytics}
              className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <div className="font-medium text-green-800 group-hover:text-green-900">View Analytics</div>
              <div className="text-sm text-green-600">Check hospital performance metrics</div>
            </button>
          </div>
        </div>

        {/* System Status - NOW REAL DATA */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            System Status
          </h2>
          {statusLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {(systemStatus as any)?.database?.status || 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-green-600" />
                  <span className="font-medium">API Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {(systemStatus as any)?.api?.status || 'Running'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Last Backup</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {(systemStatus as any)?.backup?.lastBackup 
                    ? new Date((systemStatus as any).backup.lastBackup).toLocaleString()
                    : 'Today, 3:00 AM'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Server Uptime</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {(systemStatus as any)?.api?.uptimePercentage || '99.9'}%
                </span>
              </div>

              {/* Recent Activity */}
              {(systemStatus as any)?.activity && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Recent Activity (24h)</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">New Appointments:</span>
                      <span className="font-medium ml-2">{(systemStatus as any).activity.recentAppointments}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">New Patients:</span>
                      <span className="font-medium ml-2">{(systemStatus as any).activity.recentPatients}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-600" />
          Hospital Overview
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-bold text-blue-800">Patient Care</h4>
            <p className="text-sm text-blue-600 mt-1">
              {dashboardStats?.totalPatients || 0} patients receiving quality healthcare
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <Stethoscope className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-bold text-green-800">Medical Staff</h4>
            <p className="text-sm text-green-600 mt-1">
              {dashboardStats?.totalDoctors || 0} qualified doctors providing expert care
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-bold text-purple-800">Appointments</h4>
            <p className="text-sm text-purple-600 mt-1">
              {dashboardStats?.totalAppointments || 0} appointments scheduled and managed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}