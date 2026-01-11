import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { HOSPITAL_BRANDING } from '../config/branding';
import { getRoleDashboardImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export default function SplitScreenRegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalHistory: "",
    role: "patient"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        medicalHistory: formData.medicalHistory,
        role: formData.role
      });

      if (response.data.success || response.data.message) {
        toast.success("Registration successful! Please login to continue.");
        navigate("/login?role=patient");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
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
            src={getRoleDashboardImage('patient')}
            alt="Medical Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full overflow-hidden opacity-15 blur-sm healthcare-float-delayed">
          <img 
            src={getRoleDashboardImage('doctor')}
            alt="Healthcare Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full overflow-hidden opacity-10 blur-md animate-pulse">
          <img 
            src={getRoleDashboardImage('admin')}
            alt="Medical Care Background" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Registration Card */}
          <div className="healthcare-glass-hero p-8 healthcare-scale-in">
            {/* Back Button - Inside Card Header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            </div>

            {/* Minimal Header - Only 2 Lines */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {HOSPITAL_BRANDING.shortName}
              </h1>
              <p className="text-white/80 text-lg">
                Patient Registration
              </p>
            </div>

            {/* Registration Form with Proper Labels and Accessibility */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="First Name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-white mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 text-black focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-white mb-2">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 min-h-[80px] resize-none text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-semibold text-white mb-2">
                  Emergency Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    id="emergencyContact"
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="healthcare-input w-full pl-10 pr-12 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Create a strong password"
                      required
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
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="healthcare-input w-full pl-10 pr-12 text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Medical History - Optional */}
              <div>
                <label htmlFor="medicalHistory" className="block text-sm font-semibold text-white mb-2">
                  Medical History (Optional)
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    className="healthcare-input w-full pl-10 pr-4 min-h-[80px] resize-none text-black placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Any relevant medical history, allergies, or conditions"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="healthcare-btn-premium w-full healthcare-hover-glow-premium focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-white/20">
              <p className="text-white/80 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login?role=patient" 
                  className="font-medium text-white hover:text-white/80 underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Secure Registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}