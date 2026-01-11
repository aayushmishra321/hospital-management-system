import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, X, Activity, User, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { HOSPITAL_BRANDING } from '../config/branding';
import { NotificationDropdown } from './NotificationDropdown';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  role: string;
}

export function DashboardLayout({ children, menuItems, role }: DashboardLayoutProps) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = path;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const roleColors = {
    admin: 'from-purple-600 to-blue-600',
    doctor: 'from-blue-600 to-cyan-600',
    patient: 'from-green-600 to-teal-600',
    receptionist: 'from-orange-600 to-red-600',
  };

  const roleLogo = {
    admin: '/Admin and doctors/logo.png',
    doctor: '/Admin and doctors/doc.png',
    patient: '/Patient/logo.png',
    receptionist: '/receptionist/receptionist.webp',
  };

  const roleBackground = {
    admin: '/Admin and doctors/docHolder.jpg',
    doctor: '/Admin and doctors/docHolder.jpg',
    patient: '/Patient/hero.png',
    receptionist: '/receptionist/receptionisr h.jpeg',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className={`bg-gradient-to-r ${roleColors[role as keyof typeof roleColors]} text-white shadow-lg`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                <img 
                  src={roleLogo[role as keyof typeof roleLogo]} 
                  alt={`${role} logo`}
                  className="w-8 h-8 rounded-full object-cover bg-white/20 p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxwYXRoIGQ9Ik0xNiA4QzEyLjY4NjMgOCAxMCAxMC42ODYzIDEwIDE0QzEwIDE3LjMxMzcgMTIuNjg2MyAyMCAxNiAyMEMxOS4zMTM3IDIwIDIyIDE3LjMxMzcgMjIgMTRDMjIgMTAuNjg2MyAxOS4zMTM3IDggMTYgOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                  }}
                />
                <div>
                  <h1 className="text-xl font-bold">{HOSPITAL_BRANDING.shortName}</h1>
                  <p className="text-xs text-white/80 capitalize">{role} Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              {/* User Menu Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-white/80">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold overflow-hidden">
                    <img 
                      src={roleLogo[role as keyof typeof roleLogo]} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.textContent = user?.name?.charAt(0) || 'U';
                      }}
                    />
                    <span className="hidden">{user?.name?.charAt(0)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/80" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => handleNavigation('/dashboard/profile')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/settings')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile User Info */}
              <div className="md:hidden flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 py-6 px-4 overflow-y-auto">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                 (item.path !== `/${role}` && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${roleColors[role as keyof typeof roleColors]} text-white shadow-lg`
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
