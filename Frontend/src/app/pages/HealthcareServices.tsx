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
  Brain,
  Baby,
  Stethoscope,
  Activity,
  Clock,
  Award,
  Eye,
  Bone,
  Zap,
  Microscope,
  Scissors,
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import { getDepartmentImage } from '../utils/unsplashImages';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export function HealthcareServices() {
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

  const services = [
    {
      icon: Activity,
      title: 'Emergency Medicine',
      description: 'Comprehensive 24/7 emergency care with advanced trauma facilities and experienced emergency physicians.',
      features: [
        'Trauma and critical care',
        'Emergency surgery capabilities',
        'Advanced life support',
        'Pediatric emergency care',
        'Cardiac emergency response'
      ],
      image: getDepartmentImage('emergency')
    },
    {
      icon: Heart,
      title: 'Cardiology',
      description: 'Complete cardiovascular care including diagnostics, interventional procedures, and cardiac rehabilitation.',
      features: [
        'Cardiac catheterization',
        'Echocardiography',
        'Stress testing',
        'Pacemaker implantation',
        'Heart failure management'
      ],
      image: getDepartmentImage('cardiology')
    },
    {
      icon: Brain,
      title: 'Neurology',
      description: 'Advanced neurological care for disorders of the brain, spine, and nervous system.',
      features: [
        'Stroke treatment and prevention',
        'Epilepsy management',
        'Movement disorders',
        'Neurological rehabilitation',
        'Brain imaging and diagnostics'
      ],
      image: getDepartmentImage('neurology')
    },
    {
      icon: Baby,
      title: 'Pediatrics',
      description: 'Specialized healthcare for infants, children, and adolescents in a child-friendly environment.',
      features: [
        'Well-child checkups',
        'Immunizations',
        'Developmental assessments',
        'Pediatric subspecialties',
        'Family-centered care'
      ],
      image: getDepartmentImage('pediatrics')
    },
    {
      icon: Bone,
      title: 'Orthopedics',
      description: 'Comprehensive musculoskeletal care including joint replacement, sports medicine, and trauma surgery.',
      features: [
        'Joint replacement surgery',
        'Sports injury treatment',
        'Fracture care',
        'Arthroscopic procedures',
        'Physical rehabilitation'
      ],
      image: getDepartmentImage('orthopedics')
    },
    {
      icon: Eye,
      title: 'Ophthalmology',
      description: 'Complete eye care services including medical and surgical treatment of eye conditions.',
      features: [
        'Cataract surgery',
        'Retinal disorders',
        'Glaucoma treatment',
        'Corneal diseases',
        'Pediatric ophthalmology'
      ],
      image: getDepartmentImage('ent')
    },
    {
      icon: Stethoscope,
      title: 'Internal Medicine',
      description: 'Primary care and management of complex medical conditions in adults.',
      features: [
        'Preventive care',
        'Chronic disease management',
        'Health screenings',
        'Medication management',
        'Specialist coordination'
      ],
      image: getDepartmentImage('orthopedics')
    },
    {
      icon: Scissors,
      title: 'General Surgery',
      description: 'Comprehensive surgical services using minimally invasive techniques when possible.',
      features: [
        'Laparoscopic surgery',
        'Hernia repair',
        'Gallbladder surgery',
        'Appendectomy',
        'Wound care'
      ],
      image: getDepartmentImage('oncology')
    },
    {
      icon: Microscope,
      title: 'Laboratory Services',
      description: 'Advanced diagnostic testing with rapid results and accurate analysis.',
      features: [
        'Blood chemistry analysis',
        'Microbiology testing',
        'Pathology services',
        'Genetic testing',
        'Point-of-care testing'
      ],
      image: getDepartmentImage('radiology')
    },
    {
      icon: Zap,
      title: 'Radiology',
      description: 'State-of-the-art medical imaging services for accurate diagnosis and treatment planning.',
      features: [
        'CT and MRI scans',
        'X-ray imaging',
        'Ultrasound',
        'Mammography',
        'Interventional radiology'
      ],
      image: getDepartmentImage('radiology')
    },
    {
      icon: Activity,
      title: 'Physical Therapy',
      description: 'Rehabilitation services to restore function, reduce pain, and prevent disability.',
      features: [
        'Post-surgical rehabilitation',
        'Sports injury recovery',
        'Pain management',
        'Balance training',
        'Occupational therapy'
      ],
      image: getDepartmentImage('physiotherapy')
    },
    {
      icon: Users,
      title: 'Family Medicine',
      description: 'Comprehensive healthcare for patients of all ages, from newborns to seniors.',
      features: [
        'Routine checkups',
        'Immunizations',
        'Chronic care management',
        'Minor procedures',
        'Health education'
      ],
      image: getDepartmentImage('pediatrics')
    }
  ];

  const specialtyServices = [
    {
      title: 'Telemedicine',
      description: 'Virtual consultations for convenient access to healthcare from home.',
      icon: Activity
    },
    {
      title: 'Health Screenings',
      description: 'Comprehensive preventive screenings for early detection and prevention.',
      icon: CheckCircle
    },
    {
      title: 'Wellness Programs',
      description: 'Community health programs focused on prevention and healthy living.',
      icon: Heart
    },
    {
      title: 'Patient Education',
      description: 'Educational resources and programs to help patients manage their health.',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen healthcare-mountain-bg-alt2">
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
              <Link to="/about" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                About
              </Link>
              <Link to="/services" className="healthcare-nav-link-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-3 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300">
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
                <Link to="/" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/about" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/services" className="healthcare-nav-link-mobile-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-4 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link to="/contact" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <Link to="/login?role=patient" className="healthcare-btn-redesigned bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-bold px-6 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 shadow-xl text-center mt-3" onClick={() => setMobileMenuOpen(false)}>Patient Portal</Link>
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
          <span className="text-blue-600">Services</span>
        </div>
      </div>

      {/* Hero Section - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 healthcare-glass-overlay p-8 rounded-3xl">
            <h1 className="text-4xl lg:text-5xl healthcare-heading-enhanced mb-6">
              Our Medical <span className="text-teal-600">Services</span>
            </h1>
            <p className="text-xl healthcare-text-enhanced max-w-3xl mx-auto">
              Comprehensive healthcare services delivered by experienced medical professionals 
              using advanced technology and evidence-based practices to ensure the best possible outcomes.
            </p>
          </div>

          {/* Service Categories - Enhanced Glass Effect */}
          <div className="healthcare-glass-hero p-8 mb-16 rounded-3xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialtyServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="font-semibold healthcare-heading-enhanced mb-2">{service.title}</h3>
                    <p className="healthcare-text-enhanced text-sm">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Services - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 healthcare-glass-overlay p-8 rounded-3xl">
            <h2 className="text-3xl lg:text-4xl healthcare-heading-enhanced mb-4">
              Medical Specialties
            </h2>
            <p className="text-lg healthcare-text-enhanced max-w-2xl mx-auto">
              Our comprehensive range of medical specialties ensures that you receive 
              expert care for all your healthcare needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index} 
                  className="healthcare-service-card healthcare-hover-glass rounded-3xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold healthcare-heading-enhanced">
                      {service.title}
                    </h3>
                  </div>
                  
                  <div className="healthcare-glass-card p-4 rounded-xl mb-4">
                    <p className="healthcare-text-enhanced text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h4 className="font-medium healthcare-heading-enhanced text-sm">Key Services:</h4>
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs healthcare-text-enhanced">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-xs healthcare-text-enhanced text-teal-600">
                        +{service.features.length - 3} more services
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to="/login?role=patient"
                    className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors text-sm"
                  >
                    Schedule Consultation
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Services Highlight - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="healthcare-glass-ultra p-8 lg:p-12 rounded-3xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl healthcare-heading-enhanced">24/7 Emergency Care</h2>
                </div>
                <div className="healthcare-glass-card p-6 rounded-2xl mb-6">
                  <p className="healthcare-text-enhanced mb-6">
                    Our emergency department is staffed around the clock with experienced physicians, 
                    nurses, and support staff ready to handle any medical emergency. We provide 
                    immediate, life-saving care when you need it most.
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    'Immediate triage and assessment',
                    'Advanced trauma care capabilities',
                    'Cardiac emergency response team',
                    'Pediatric emergency specialists',
                    'Direct admission to specialized units'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="healthcare-text-enhanced text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`tel:${HOSPITAL_BRANDING.contact.phone}`}
                    className="healthcare-btn-premium flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Emergency: {HOSPITAL_BRANDING.contact.phone}
                  </a>
                  <Link 
                    to="/contact"
                    className="healthcare-btn-secondary-premium flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Directions
                  </Link>
                </div>
              </div>
              
              <div className="healthcare-glass-card p-6 rounded-3xl">
                <h3 className="font-semibold healthcare-heading-enhanced mb-4">Emergency Department Hours</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="healthcare-text-enhanced">Emergency Care</span>
                    <span className="font-medium text-red-600">24/7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="healthcare-text-enhanced">Trauma Center</span>
                    <span className="font-medium text-red-600">24/7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="healthcare-text-enhanced">Pediatric Emergency</span>
                    <span className="font-medium text-red-600">24/7</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">When to Visit Emergency</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Chest pain or difficulty breathing</li>
                    <li>• Severe injuries or trauma</li>
                    <li>• Signs of stroke or heart attack</li>
                    <li>• Severe allergic reactions</li>
                  </ul>
                </div>
              </div>
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
              Ready to Schedule Your Appointment?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Our medical specialists are ready to provide you with expert care. 
              Schedule your consultation today and take the first step towards better health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/login?role=patient" 
                className="healthcare-glass-card bg-white/20 text-white hover:bg-white/30 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl border border-white/30"
              >
                <span className="flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
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