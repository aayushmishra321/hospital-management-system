import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  User, 
  Shield, 
  Stethoscope, 
  Users, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Activity,
  Heart,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { HOSPITAL_BRANDING, getWelcomeMessage } from '../config/branding';
import { getRoleLoginImage, getRoleDashboardImage, getSmartImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';

export function PremiumLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Login Form
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  // Role-specific configurations with premium styling
  const roleConfigs = {
    admin: {
      title: 'Admin Portal',
      subtitle: 'Hospital Management System',
      quote: 'Empowering healthcare through intelligent administration',
      contextualText: 'Managing healthcare excellence, one decision at a time',
      icon: Shield,
      color: 'from-slate-600 to-blue-700',
      bgImage: getRoleLoginImage('admin'),
      glassClass: 'glass-card-admin',
      buttonClass: 'glass-button-admin',
      defaultCredentials: { email: 'admin@hospital.com', password: 'admin123' }
    },
    doctor: {
      title: 'Doctor Portal',
      subtitle: 'Medical Excellence Platform',
      quote: 'Healing lives through compassionate care and expertise',
      contextualText: 'Where medical expertise meets patient care',
      icon: Stethoscope,
      color: 'from-cyan-500 to-teal-600',
      bgImage: getRoleLoginImage('doctor'),
      glassClass: 'glass-card-doctor',
      buttonClass: 'glass-button-doctor',
      defaultCredentials: { email: 'doctor@hospital.com', password: 'doctor123' }
    },
    patient: {
      title: 'Patient Portal',
      subtitle: 'Your Health Journey',
      quote: 'Your health, our priority - together towards wellness',
      contextualText: 'Caring for patients starts with better systems',
      icon: Heart,
      color: 'from-blue-500 to-purple-600',
      bgImage: getRoleLoginImage('patient'),
      glassClass: 'glass-card-patient',
      buttonClass: 'glass-button-patient',
      defaultCredentials: { email: 'patient@hospital.com', password: 'patient123' }
    },
    receptionist: {
      title: 'Receptionist Portal',
      subtitle: 'Front Desk Excellence',
      quote: 'First impressions, lasting care - the heart of hospitality',
      contextualText: 'Creating welcoming experiences for every patient',
      icon: UserCheck,
      color: 'from-purple-500 to-pink-600',
      bgImage: getRoleLoginImage('receptionist'),
      glassClass: 'glass-card-receptionist',
      buttonClass: 'glass-button-receptionist',
      defaultCredentials: { email: 'receptionist@hospital.com', password: 'receptionist123' }
    }
  };

  // Get role from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && roleConfigs[roleParam]) {
      setSelectedRole(roleParam);
      setStep(2);
      // Set default credentials for demo
      const config = roleConfigs[roleParam];
      setEmail(config.defaultCredentials.email);
      setPassword(config.defaultCredentials.password);
    }
  }, [searchParams]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep(2);
    const config = roleConfigs[role];
    setEmail(config.defaultCredentials.email);
    setPassword(config.defaultCredentials.password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role: selectedRole
      });

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        login(response.data.user);
        toast.success(`Welcome back! ${getWelcomeMessage(selectedRole)}`);
        
        // Navigate based on role
        const dashboardRoutes = {
          admin: '/admin',
          doctor: '/doctor',
          patient: '/patient',
          receptionist: '/receptionist'
        };
        
        navigate(dashboardRoutes[selectedRole] || '/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = selectedRole ? roleConfigs[selectedRole] : null;

  // Step 1: Role Selection
  if (step === 1) {
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

        {/* Role Selection Cards */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12 healthcare-slide-up">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="healthcare-logo-premium">
                  <img 
                    src="/hospital-logo.png"
                    alt={HOSPITAL_BRANDING.shortName}
                    className="healthcare-logo-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="healthcare-logo-fallback hidden">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="healthcare-logo-text">
                    <h1 className="healthcare-logo-title text-4xl">{HOSPITAL_BRANDING.shortName}</h1>
                    <p className="healthcare-logo-tagline text-xl">{HOSPITAL_BRANDING.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(roleConfigs).map(([role, config], index) => {
                const Icon = config.icon;
                return (
                  <div
                    key={role}
                    className="healthcare-glass-card healthcare-hover-premium cursor-pointer healthcare-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg healthcare-glow`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 healthcare-heading-enhanced">
                        {config.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-4 healthcare-body-enhanced">
                        {config.subtitle}
                      </p>
                      <div className="flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <span className="text-sm">Access Portal</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 healthcare-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Secure Medical Records</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Trusted by 100+ Clinics</span>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-8 healthcare-slide-up" style={{ animationDelay: '0.8s' }}>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Login Form
  return (
    <div className="healthcare-mountain-bg min-h-screen relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full overflow-hidden opacity-20 blur-sm healthcare-float">
          <img 
            src={currentConfig?.bgImage || getRoleLoginImage('admin')}
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

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => setStep(1)}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors healthcare-slide-up"
          >
            <ArrowLeft className="w-4 h-4" />
            Choose Different Role
          </button>

          {/* Login Card */}
          <div className="healthcare-glass-hero p-8 healthcare-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentConfig?.color} flex items-center justify-center shadow-lg healthcare-glow`}>
                  {currentConfig?.icon && <currentConfig.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white healthcare-heading-enhanced">
                    {currentConfig?.title}
                  </h2>
                  <p className="text-white/80 text-sm healthcare-body-enhanced">
                    {currentConfig?.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-sm italic healthcare-text-enhanced">
                {currentConfig?.quote}
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="healthcare-logo-premium">
                  <img 
                    src="/hospital-logo.png"
                    alt={HOSPITAL_BRANDING.shortName}
                    className="healthcare-logo-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="healthcare-logo-fallback hidden">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="healthcare-logo-text">
                    <h3 className="healthcare-logo-title">{HOSPITAL_BRANDING.shortName}</h3>
                    <p className="healthcare-logo-tagline">{HOSPITAL_BRANDING.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2 healthcare-text-enhanced">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="healthcare-input w-full pl-10 text-white placeholder-white/60"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2 healthcare-text-enhanced">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="healthcare-input w-full pl-10 pr-10 text-white placeholder-white/60"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="healthcare-btn-premium w-full healthcare-hover-glow-premium"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

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

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-white/80 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-white hover:text-white/80 font-medium underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}