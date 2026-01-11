import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  Shield, 
  Stethoscope, 
  Heart, 
  UserCheck,
  Eye,
  EyeOff,
  Activity,
  CheckCircle
} from 'lucide-react';
import { HOSPITAL_BRANDING, getWelcomeMessage } from '../config/branding';
import { getRoleLoginImage, getSmartImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export function SplitScreenLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  const roleParam = searchParams.get('role');

  // Role-specific configurations - NO CREDENTIALS EXPOSED
  const roleConfigs = {
    admin: {
      title: 'Admin Portal',
      subtitle: 'Hospital Management System',
      icon: Shield,
      accentColor: 'from-slate-600 to-blue-700'
    },
    doctor: {
      title: 'Doctor Portal',
      subtitle: 'Medical Excellence Platform',
      icon: Stethoscope,
      accentColor: 'from-cyan-500 to-teal-600'
    },
    patient: {
      title: 'Patient Portal',
      subtitle: 'Your Health Journey',
      icon: Heart,
      accentColor: 'from-blue-500 to-purple-600'
    },
    receptionist: {
      title: 'Receptionist Portal',
      subtitle: 'Front Desk Excellence',
      icon: UserCheck,
      accentColor: 'from-purple-500 to-pink-600'
    }
  };

  const currentRole = roleParam && roleConfigs[roleParam as keyof typeof roleConfigs] 
    ? roleParam as keyof typeof roleConfigs 
    : 'patient';

  const config = roleConfigs[currentRole];
  const Icon = config.icon;

  // Clear form for all roles - use placeholders instead of pre-filling
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [currentRole]);

  const clearForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role: currentRole
      });

      if (response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        login(response.data.user);
        toast.success(`Welcome back! ${getWelcomeMessage(currentRole)}`);
        
        // Navigate to unified dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="healthcare-mountain-bg min-h-screen relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full overflow-hidden opacity-20 blur-sm healthcare-float">
          <img 
            src={getRoleLoginImage('admin')}
            alt="Medical Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full overflow-hidden opacity-15 blur-sm healthcare-float-delayed">
          <img 
            src={getRoleLoginImage('doctor')}
            alt="Healthcare Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full overflow-hidden opacity-10 blur-md animate-pulse">
          <img 
            src={getRoleLoginImage('patient')}
            alt="Medical Care Background" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="healthcare-glass-hero p-8 healthcare-scale-in">
            {/* Back Button - Inside Card Header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            </div>

            {/* Minimal Header - Only 2 Lines */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${config.accentColor} rounded-full mb-4 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {HOSPITAL_BRANDING.shortName}
              </h1>
              <p className="text-white/80 text-lg">
                {config.title}
              </p>
            </div>



            {/* Login Form with Proper Labels and Accessibility */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 healthcare-text-enhanced">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your email address"
                    required
                    aria-describedby="email-help"
                  />
                </div>
                <p id="email-help" className="text-xs text-white/70 mt-1">
                  Use your registered email address
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 healthcare-text-enhanced">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="healthcare-input w-full pl-10 pr-12 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your password"
                    required
                    aria-describedby="password-help"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p id="password-help" className="text-xs text-white/70 mt-1">
                  Enter your secure password
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="healthcare-btn-premium w-full healthcare-hover-glow-premium focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link - Only Below Sign In (Industry Standard) */}
            {currentRole === 'patient' && (
              <div className="text-center mt-6 pt-6 border-t border-white/20">
                <p className="text-white/80 text-sm">
                  New patient?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-white hover:text-teal-200 underline transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            )}

            {/* Role Selection */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-center text-sm text-white/80 mb-4">
                Login as different role:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(roleConfigs).filter(([role]) => role !== currentRole).map(([role, roleConfig]) => {
                  const RoleIcon = roleConfig.icon;
                  return (
                    <Link
                      key={role}
                      to={`/login?role=${role}`}
                      className="healthcare-glass-subtle flex items-center justify-center gap-2 py-2 px-3 text-sm text-white/80 hover:text-white transition-colors healthcare-hover-premium"
                    >
                      <RoleIcon className="w-4 h-4" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}