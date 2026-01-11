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
  Activity,
  Award,
  Target,
  Eye,
  CheckCircle,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Clock,
  Stethoscope,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import { UniformImageCard } from '../components/shared/UniformImageCard';
import { getLandingImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export function HealthcareAbout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy, respect, and understanding, ensuring comfort during their healthcare journey.'
    },
    {
      icon: CheckCircle,
      title: 'Medical Excellence',
      description: 'Our commitment to the highest standards of medical practice and continuous improvement in patient outcomes.'
    },
    {
      icon: Users,
      title: 'Patient-Centered',
      description: 'Every decision we make is guided by what is best for our patients and their families.'
    },
    {
      icon: Award,
      title: 'Professional Integrity',
      description: 'We maintain the highest ethical standards and transparency in all our medical practices and interactions.'
    },
    {
      icon: Activity,
      title: 'Innovation',
      description: 'Embracing advanced medical technologies and evidence-based practices to improve patient care.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'Continuous monitoring and improvement of our services to ensure the best possible patient experience.'
    }
  ];

  const milestones = [
    {
      year: '2010',
      title: 'Hospital Founded',
      description: 'Established with a vision to provide accessible, quality healthcare to our community.'
    },
    {
      year: '2015',
      title: 'Expansion Completed',
      description: 'Added specialized departments and increased capacity to serve more patients.'
    },
    {
      year: '2018',
      title: 'Technology Upgrade',
      description: 'Implemented state-of-the-art medical equipment and digital health records system.'
    },
    {
      year: '2020',
      title: 'Telemedicine Launch',
      description: 'Introduced virtual consultations to ensure continuous care during challenging times.'
    },
    {
      year: '2024',
      title: 'Excellence Recognition',
      description: 'Achieved top ratings for patient satisfaction and medical outcomes in our region.'
    }
  ];

  return (
    <div className="min-h-screen healthcare-mountain-bg-alt1">
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
              <Link to="/" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                Home
              </Link>
              <Link to="/about" className="healthcare-nav-link-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-3 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300">
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
                <Link to="/" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/about" className="healthcare-nav-link-mobile-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-4 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm healthcare-body">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-blue-600">About Us</span>
        </div>
      </div>

      {/* Hero Section - Full Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 healthcare-glass-overlay p-8 rounded-3xl">
            <h1 className="text-4xl lg:text-5xl healthcare-heading mb-6">
              About <span className="text-teal-600">{HOSPITAL_BRANDING.shortName}</span>
            </h1>
            <p className="text-xl healthcare-body max-w-3xl mx-auto">
              Dedicated to providing exceptional healthcare services with compassion, 
              expertise, and a commitment to improving the health and well-being of our community.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="healthcare-glass-hero p-8 rounded-3xl">
              <h2 className="text-2xl healthcare-heading mb-6">Our Story</h2>
              <div className="space-y-4 healthcare-body">
                <div className="healthcare-glass-card p-4 rounded-xl">
                  <p>
                    Founded in 2010, {HOSPITAL_BRANDING.shortName} began with a simple yet profound mission: 
                    to provide accessible, high-quality healthcare to every member of our community. 
                    What started as a small medical facility has grown into a comprehensive healthcare 
                    center serving thousands of patients annually across Delhi NCR.
                  </p>
                </div>
                <div className="healthcare-glass-card p-4 rounded-xl">
                  <p>
                    Our journey has been marked by continuous growth, innovation, and an unwavering 
                    commitment to patient care. We have expanded our services, upgraded our facilities, 
                    and assembled a team of dedicated healthcare professionals who share our vision 
                    of excellence in medical care. Today, we are proud to be NABH accredited and 
                    empanelled with CGHS, ESI, and other major healthcare schemes.
                  </p>
                </div>
                <div className="healthcare-glass-card p-4 rounded-xl">
                  <p>
                    As a leading healthcare provider in Delhi, we stand committed to serving patients 
                    from all walks of life with compassion, dignity, and respect. Our multilingual 
                    staff ensures that language is never a barrier to quality healthcare, and our 
                    affordable treatment options make world-class medical care accessible to all.
                  </p>
                </div>
              </div>
            </div>

            <div className="healthcare-fade-up">
              <div className="healthcare-glass-card p-4 rounded-3xl">
                <UniformImageCard
                  src={getLandingImage('about')}
                  alt="About Our Hospital"
                  height="h-96"
                  containerClassName="w-full rounded-2xl shadow-xl overflow-hidden"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="healthcare-glass-card p-8 healthcare-hover-glow rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl healthcare-heading-enhanced">Our Mission</h2>
              </div>
              <p className="healthcare-text-enhanced text-lg leading-relaxed">
                {HOSPITAL_BRANDING.mission}
              </p>
            </div>

            {/* Vision */}
            <div className="healthcare-glass-card p-8 healthcare-hover-glow rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl healthcare-heading-enhanced">Our Vision</h2>
              </div>
              <p className="healthcare-text-enhanced text-lg leading-relaxed">
                {HOSPITAL_BRANDING.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 healthcare-glass-overlay p-8 rounded-3xl">
            <h2 className="text-3xl lg:text-4xl healthcare-heading-enhanced mb-4">
              Our Core Values
            </h2>
            <p className="text-lg healthcare-text-enhanced max-w-2xl mx-auto">
              The principles that guide our approach to healthcare and shape our interactions 
              with patients, families, and the community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="healthcare-glass-card p-6 healthcare-hover-glass rounded-3xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mb-4 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold healthcare-heading-enhanced mb-3">
                    {value.title}
                  </h3>
                  
                  <p className="healthcare-text-enhanced text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credentials - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 healthcare-glass-overlay p-8 rounded-3xl">
            <h2 className="text-3xl lg:text-4xl healthcare-heading-enhanced mb-4">
              Accreditations & Certifications
            </h2>
            <p className="text-lg healthcare-text-enhanced max-w-2xl mx-auto">
              Our commitment to quality healthcare is recognized by leading healthcare 
              authorities and government bodies across India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOSPITAL_BRANDING.credentials.map((credential, index) => (
              <div 
                key={index} 
                className="healthcare-glass-card p-6 healthcare-hover-glow text-center rounded-3xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold healthcare-heading-enhanced mb-2">
                  {credential}
                </h3>
                
                <p className="healthcare-text-enhanced text-sm">
                  Certified and recognized for maintaining the highest standards of healthcare delivery.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 healthcare-glass-overlay p-8 rounded-3xl">
            <h2 className="text-3xl lg:text-4xl healthcare-heading-enhanced mb-4">
              Our Journey
            </h2>
            <p className="text-lg healthcare-text-enhanced max-w-2xl mx-auto">
              Key milestones in our commitment to providing exceptional healthcare services 
              and serving our community.
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                className="healthcare-glass-card p-6 healthcare-hover-glass rounded-3xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold healthcare-heading-enhanced mb-2">
                      {milestone.title}
                    </h3>
                    <p className="healthcare-text-enhanced">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="healthcare-glass-ultra p-8 lg:p-12 rounded-3xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl healthcare-heading-enhanced mb-4">
                Healthcare Excellence in Numbers
              </h2>
              <p className="healthcare-text-enhanced">
                Our commitment to quality care reflected in our achievements and patient outcomes.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '15,000+', label: 'Patients Served Annually', icon: Users },
                { number: '150+', label: 'Medical Professionals', icon: Stethoscope },
                { number: '25+', label: 'Medical Specialties', icon: Activity },
                { number: '99.8%', label: 'Patient Satisfaction', icon: Award }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="text-3xl font-bold healthcare-heading-enhanced mb-2">{stat.number}</div>
                    <div className="healthcare-text-enhanced text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Glass Effect */}
      <section className="py-20 lg:py-32 relative overflow-hidden z-10 healthcare-glass-section">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl healthcare-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl healthcare-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="healthcare-glass-hero p-12 rounded-3xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Experience Our Commitment to Excellence
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of patients who have trusted us with their healthcare needs. 
              Schedule your appointment today and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/login?role=patient" 
                className="healthcare-glass-card bg-white/20 text-white hover:bg-white/30 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl border border-white/30"
              >
                <span className="flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5" />
                  Schedule Appointment
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              
              <Link 
                to="/contact" 
                className="healthcare-glass-card border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                <span className="flex items-center justify-center gap-3">
                  <Phone className="w-5 h-5" />
                  Contact Us
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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