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
  CheckCircle,
  Eye,
  EyeOff,
  Activity,
  Heart,
  Shield,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { HOSPITAL_BRANDING } from '../config/branding';
import { getRoleDashboardImage, getDepartmentImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';

export default function PremiumRegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Personal Info, 2: Account Details, 3: Verification

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

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3:
        return formData.address && formData.dateOfBirth;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        medicalHistory: formData.medicalHistory,
        role: formData.role
      });

      if (response.data.success) {
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

  const stepTitles = {
    1: "Personal Information",
    2: "Account Security", 
    3: "Additional Details"
  };

  const stepIcons = {
    1: User,
    2: Shield,
    3: Heart
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background Images */}
      <div className="absolute inset-0">
        <img 
          src={getRoleDashboardImage('patient')}
          alt="Healthcare Background"
          className="w-full h-full object-cover"
        />
        <div className="contextual-overlay">
          <div className="contextual-text fade-in-up">
            Join our healthcare community - Your wellness journey starts here
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full overflow-hidden opacity-20 blur-sm animate-float">
          <img 
            src={getRoleDashboardImage('patient')}
            alt="Medical Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full overflow-hidden opacity-15 blur-sm animate-float-delayed">
          <img 
            src={getDepartmentImage('cardiology')}
            alt="Healthcare Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full overflow-hidden opacity-10 blur-md animate-pulse">
          <img 
            src={getRoleDashboardImage('patient')}
            alt="Medical Care Background" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <Link
            to="/login"
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors fade-in-left"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Registration Card */}
          <div className="glass-card-patient p-8 card-enter">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Join {HOSPITAL_BRANDING.shortName}
                  </h2>
                  <p className="text-white/80 text-sm">
                    Create your patient account
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((stepNumber) => {
                const StepIcon = stepIcons[stepNumber];
                const isActive = step === stepNumber;
                const isCompleted = step > stepNumber;
                
                return (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-white text-blue-600 scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`
                        w-16 h-1 mx-2 transition-all duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-white/20'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Title */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {stepTitles[step]}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                Step {step} of 3
              </p>
            </div>

            {/* Form Steps */}
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6 fade-in-up">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="glass-input w-full pl-10 input-focus-glow"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="glass-input w-full pl-10 input-focus-glow"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 input-focus-glow"
                        placeholder="john.doe@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 input-focus-glow"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Account Security */}
              {step === 2 && (
                <div className="space-y-6 fade-in-up">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 pr-10 input-focus-glow"
                        placeholder="Create a strong password"
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

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 pr-10 input-focus-glow"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/80 text-sm mb-2">Password Requirements:</p>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-400' : 'text-white/60'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Details */}
              {step === 3 && (
                <div className="space-y-6 fade-in-up">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 min-h-[80px] resize-none input-focus-glow"
                        placeholder="Enter your full address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 input-focus-glow"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Emergency Contact
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 input-focus-glow"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Medical History (Optional)
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        className="glass-input w-full pl-10 min-h-[80px] resize-none input-focus-glow"
                        placeholder="Any relevant medical history, allergies, or conditions"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="glass-button hover-lift"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </div>
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !validateStep(step)}
                  className={`glass-button-patient btn-hover-lift ml-auto ${loading ? 'loading-pulse' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-dots">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                      </div>
                      <span>Creating Account...</span>
                    </div>
                  ) : step === 3 ? (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Continue</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="trust-indicators mt-6">
              <div className="trust-indicator">
                <CheckCircle className="trust-icon" />
                <span>Secure Registration</span>
              </div>
              <div className="trust-indicator">
                <CheckCircle className="trust-icon" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="trust-indicator">
                <CheckCircle className="trust-icon" />
                <span>Data Protected</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-white/80 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-white hover:text-white/80 font-medium underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}