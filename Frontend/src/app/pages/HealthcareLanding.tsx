import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin,
  Menu,
  X,
  Users,
  Heart,
  Stethoscope,
  Activity,
  Award,
  ArrowRight,
  CheckCircle,
  Calendar,
  ChevronRight,
  UserCheck,
  Zap,
  Globe,
  MessageCircle
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import { getDepartmentImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export function HealthcareLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Removed scrolled state as it's not used
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsVisible(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const services = [
    {
      icon: Activity,
      title: 'Emergency Care',
      description: '24/7 emergency medical services with experienced trauma specialists and advanced life support.',
      image: getDepartmentImage('emergency'),
      color: 'from-red-500 to-pink-600',
      features: ['24/7 Availability', 'Expert Staff', 'Advanced Equipment']
    },
    {
      icon: Heart,
      title: 'Cardiology',
      description: 'Comprehensive heart care including diagnostics, treatment, and preventive cardiology services.',
      image: getDepartmentImage('cardiology'),
      color: 'from-teal-500 to-cyan-600',
      features: ['Heart Surgery', 'Preventive Care', 'Cardiac Rehab']
    },
    {
      icon: Stethoscope,
      title: 'General Medicine',
      description: 'Primary healthcare services for routine check-ups, preventive care, and chronic disease management.',
      image: getDepartmentImage('orthopedics'),
      color: 'from-blue-500 to-indigo-600',
      features: ['Routine Checkups', 'Preventive Care', 'Health Screenings']
    },
    {
      icon: Users,
      title: 'Pediatrics',
      description: 'Specialized healthcare for infants, children, and adolescents in a child-friendly environment.',
      image: getDepartmentImage('pediatrics'),
      color: 'from-pink-500 to-rose-600',
      features: ['Child Specialists', 'Family Care', 'Play Therapy']
    }
  ];

  const stats = [
    { number: '15,000+', label: 'Patients Served', icon: Users },
    { number: '150+', label: 'Medical Staff', icon: Stethoscope },
    { number: '25+', label: 'Specialties', icon: Activity },
    { number: '99.8%', label: 'Patient Satisfaction', icon: Award }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered appointment scheduling that finds the perfect time for you and your doctor.'
    },
    {
      icon: UserCheck,
      title: 'Expert Doctors',
      description: 'Board-certified physicians with years of experience in their specialized fields.'
    },
    {
      icon: CheckCircle,
      title: 'Secure Records',
      description: 'HIPAA-compliant digital health records accessible anytime, anywhere.'
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Quick lab results and diagnostic reports delivered directly to your portal.'
    },
    {
      icon: Globe,
      title: 'Telemedicine',
      description: 'Virtual consultations with your healthcare providers from the comfort of home.'
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Round-the-clock patient support for any questions or concerns.'
    }
  ];

  return (
    <div className="min-h-screen healthcare-mountain-bg overflow-x-hidden">
      {/* Optimized Background Elements - Reduced for Performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-teal-200/5 to-cyan-200/5 rounded-full blur-2xl"
          style={{
            left: '10%',
            top: '20%',
          }}
        />
        <div 
          className="absolute w-48 h-48 bg-gradient-to-r from-mint-200/5 to-sage-200/5 rounded-full blur-2xl"
          style={{
            right: '15%',
            bottom: '25%',
          }}
        />
      </div>

      {/* Redesigned Premium Navigation - Enhanced Branding & Larger Text */}
      <nav className="healthcare-navbar-redesigned">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            {/* Enhanced Logo Section - Much Larger & More Prominent */}
            <div className="healthcare-logo-redesigned">
              <div className="flex items-center gap-4">
                {/* Logo Icon - Larger and More Visible */}
                <div className="healthcare-logo-icon">
                  <img 
                    src={HOSPITAL_BRANDING.logos.main} 
                    alt={HOSPITAL_BRANDING.shortName}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="healthcare-logo-fallback-redesigned hidden w-16 h-16 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Brand Text - Much Larger */}
                <div className="healthcare-brand-text">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {HOSPITAL_BRANDING.shortName}
                  </h1>
                  <p className="text-sm font-medium text-teal-600 mt-1">
                    {HOSPITAL_BRANDING.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Larger Text & Better Spacing */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="healthcare-nav-link-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-3 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300">
                Home
              </Link>
              <Link to="/about" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                About
              </Link>
              <Link to="/services" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                Services
              </Link>
              <Link to="/contact" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                Contact
              </Link>
              
              <Link 
                to="/login?role=patient" 
                className="healthcare-btn-redesigned bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-bold px-8 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ml-4"
              >
                Patient Portal
              </Link>
            </div>

            {/* Mobile Menu Button - Larger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden healthcare-mobile-btn p-4 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>

          {/* Mobile Menu - Redesigned with Larger Text */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 healthcare-mobile-menu-redesigned">
              <div className="flex flex-col gap-4">
                <Link to="/" className="healthcare-nav-link-mobile-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-4 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/about" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link to="/services" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                  Services
                </Link>
                <Link to="/contact" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                <Link to="/login?role=patient" className="healthcare-btn-redesigned bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-bold px-6 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 shadow-xl text-center mt-3" onClick={() => setMobileMenuOpen(false)}>
                  Patient Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Premium Hero Section - Simplified */}
      <section className="relative py-20 lg:py-32 overflow-hidden z-10 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Simplified */}
            <div className={`space-y-8 transform transition-all duration-1000 healthcare-glass-overlay p-8 rounded-3xl ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 healthcare-glass-card px-6 py-3 text-sm font-medium text-teal-700">
                  <CheckCircle className="w-4 h-4" />
                  Trusted Healthcare Provider
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block healthcare-heading-enhanced">Your Health is Our</span>
                  <span className="block bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Priority
                  </span>
                </h1>
                
                <p className="text-xl healthcare-text-enhanced leading-relaxed">
                  Expert medical care with compassion and cutting-edge technology.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login?role=patient" 
                  className="group healthcare-btn-premium px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5 group-hover:animate-pulse" />
                    Book an Appointment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                
                <Link 
                  to="/services"
                  className="group healthcare-btn-secondary-premium px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Activity className="w-5 h-5 group-hover:animate-pulse" />
                    Explore Services
                  </span>
                </Link>
              </div>

              {/* Trust Indicators Above the Fold */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-white/80">15+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-white/80">NABH Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-white/80">50+ Specialists</span>
                </div>
              </div>
            </div>

            {/* Right Content - Keep Background Only */}
            <div className={`relative transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              {/* Remove duplicate image - keep only background */}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="healthcare-glass-card p-8 text-center healthcare-hover-premium rounded-2xl"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold healthcare-heading-enhanced mb-2">{stat.number}</div>
                  <div className="healthcare-text-enhanced font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Services Section - Full Glass Effect */}
      <section className="py-20 lg:py-32 relative z-10 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 healthcare-glass-overlay p-8 rounded-3xl">
            <div className="inline-flex items-center gap-2 healthcare-glass-card px-6 py-3 text-sm font-medium text-teal-700 mb-6 rounded-full">
              <Stethoscope className="w-4 h-4" />
              Our Services
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold healthcare-heading-enhanced mb-6">
              Our Medical <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl healthcare-text-enhanced max-w-3xl mx-auto">
              Comprehensive healthcare services delivered by experienced medical professionals 
              using advanced technology and evidence-based practices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index} 
                  className="group healthcare-glass-card p-8 healthcare-hover-premium rounded-3xl"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold healthcare-heading-enhanced mb-4 group-hover:text-teal-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <div className="healthcare-glass-card p-4 rounded-xl mb-6">
                    <p className="healthcare-text-enhanced leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm healthcare-text-enhanced">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to="/services"
                    className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 group-hover:gap-3 transition-all duration-300"
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Features Section - Full Glass Effect */}
      <section className="py-20 lg:py-32 relative z-10 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 healthcare-glass-overlay p-8 rounded-3xl">
            <div className="inline-flex items-center gap-2 healthcare-glass-card px-6 py-3 text-sm font-medium text-teal-700 mb-6 rounded-full">
              <Zap className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold healthcare-heading-enhanced mb-6">
              Advanced <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Technology</span>
            </h2>
            <p className="text-xl healthcare-text-enhanced max-w-3xl mx-auto">
              Experience the future of healthcare with our innovative solutions and patient-centered approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group healthcare-glass-card p-8 healthcare-hover-glow-premium rounded-3xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold healthcare-heading-enhanced mb-4 group-hover:text-teal-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <div className="healthcare-glass-card p-4 rounded-xl">
                    <p className="healthcare-text-enhanced leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium CTA Section - Full Glass Effect */}
      <section className="py-20 lg:py-32 relative overflow-hidden z-10 healthcare-glass-section">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl healthcare-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl healthcare-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="healthcare-glass-hero p-12 rounded-3xl">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Schedule Your Appointment?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Take the first step towards better health. Our medical team is ready to provide 
              you with the care and attention you deserve.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/login?role=patient" 
                className="healthcare-glass-card bg-white/20 text-white hover:bg-white/30 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl border border-white/30"
              >
                <span className="flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5" />
                  Book Appointment Now
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              
              <Link 
                to="/contact" 
                className="healthcare-glass-card border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                <span className="flex items-center justify-center gap-3">
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer - Clean Minimalistic Style */}
      <footer className="relative z-10 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="healthcare-glass-card bg-gray-800/50 p-6 rounded-2xl">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={HOSPITAL_BRANDING.logos.main} 
                    alt={HOSPITAL_BRANDING.shortName}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center hidden">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{HOSPITAL_BRANDING.shortName}</h3>
                    <p className="text-green-500 text-xs">{HOSPITAL_BRANDING.tagline}</p>
                  </div>
                </div>
                <p className="text-white text-sm max-w-md">
                  {HOSPITAL_BRANDING.description}
                </p>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-3 text-white text-sm">Quick Links</h4>
                <div className="space-y-1">
                  {['About Us', 'Services', 'Contact', 'Patient Portal'].map((link) => (
                    <Link 
                      key={link} 
                      to={link === 'Patient Portal' ? '/login?role=patient' : `/${link.toLowerCase().replace(' ', '')}`}
                      className="block text-white hover:text-green-500 transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-3 text-white text-sm">Contact Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-green-500" />
                    <span className="text-white text-xs">{HOSPITAL_BRANDING.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-green-500" />
                    <span className="text-white text-xs">{HOSPITAL_BRANDING.contact.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-green-500 mt-1" />
                    <span className="text-white text-xs">{HOSPITAL_BRANDING.contact.address}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 text-center">
              <p className="text-white text-xs">
                © 2024 {HOSPITAL_BRANDING.name}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}