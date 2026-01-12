import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { ReceptionistContext } from '../../context/ReceptionistContext';
import { UserPlus, Heart, Sparkles, Search, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const registrationQuotes = [
  "Every new patient is a new opportunity to make a difference.",
  "Welcome them with warmth, register them with care.",
  "The journey to better health starts with a single step.",
  "Your attention to detail creates their peace of mind.",
  "Building trust begins with the first interaction."
];

export function RegisterPatient() {
  const receptionistContext = useContext(ReceptionistContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState<'checking' | 'available' | 'taken' | ''>('');

  if (!receptionistContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src="/Public/Admin and doctors/loading.gif" 
          alt="Loading"
          className="w-16 h-16"
        />
      </div>
    );
  }

  const { registerPatient } = receptionistContext;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: '',
  });

  // Check email availability with real API call
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailCheckStatus('');
      return;
    }

    setEmailCheckStatus('checking');
    
    try {
      const response = await api.post('/auth/check-email', { email });
      setEmailCheckStatus(response.data.available ? 'available' : 'taken');
    } catch (error: any) {
      console.error('Email check error:', error);
      // Fallback to simple check on error
      const commonEmails = ['admin@hospital.com', 'test@test.com', 'user@example.com'];
      const isTaken = commonEmails.includes(email.toLowerCase());
      setEmailCheckStatus(isTaken ? 'taken' : 'available');
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (emailCheckStatus === 'taken') {
      toast.error('This email is already registered');
      return;
    }

    const passwordStrength = getPasswordStrength(formData.password);
    if (passwordStrength.strength < 3) {
      toast.error('Please use a stronger password');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerPatient({
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        bloodGroup: formData.bloodGroup // Include bloodGroup in submission
      });

      toast.success('Patient registered successfully');
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        age: '', 
        gender: '', 
        bloodGroup: '', 
        phone: '', 
        address: '' 
      });
      setEmailCheckStatus('');
    } catch (error) {
      toast.error('Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayQuote = registrationQuotes[new Date().getDay() % registrationQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/receptionist/receptionist.webp" 
          alt="Registration Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Patient/patient.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 to-red-50/90"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserPlus className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">Register New Patient</h1>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Registration Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      checkEmailAvailability(e.target.value);
                    }}
                    className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                    required
                  />
                  {emailCheckStatus === 'checking' && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                    </div>
                  )}
                </div>
                {emailCheckStatus === 'available' && (
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Email available
                  </p>
                )}
                {emailCheckStatus === 'taken' && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Email already registered
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-orange-200 px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                          style={{ width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getPasswordStrength(formData.password).label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Use 8+ characters with uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Age</label>
                <input
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Address</label>
              <textarea
                placeholder="123 Main Street, City, State, ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-orange-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
