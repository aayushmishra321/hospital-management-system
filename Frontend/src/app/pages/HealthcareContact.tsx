import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin,
  Menu,
  X,
  Clock,
  Activity,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Navigation,
  Users,
  Heart,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import '../styles/healthcareGlass.css';
import '../styles/cardVisibilityFix.css';

export function HealthcareContact() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      primary: HOSPITAL_BRANDING.contact.phone,
      secondary: 'Available 24/7 for emergencies',
      action: `tel:${HOSPITAL_BRANDING.contact.phone}`,
      actionText: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email',
      primary: HOSPITAL_BRANDING.contact.email,
      secondary: 'We respond within 24 hours',
      action: `mailto:${HOSPITAL_BRANDING.contact.email}`,
      actionText: 'Send Email'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      primary: HOSPITAL_BRANDING.contact.address,
      secondary: 'Open daily for appointments',
      action: '#',
      actionText: 'Get Directions'
    }
  ];

  const operatingHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Emergency Services', hours: '24/7', highlight: true }
  ];

  const departments = [
    { name: 'Emergency Department', phone: HOSPITAL_BRANDING.contact.emergency, extension: '' },
    { name: 'Appointment Scheduling', phone: HOSPITAL_BRANDING.contact.phone, extension: '100' },
    { name: 'Patient Information', phone: HOSPITAL_BRANDING.contact.phone, extension: '200' },
    { name: 'Billing Department', phone: HOSPITAL_BRANDING.contact.phone, extension: '300' }
  ];

  return (
    <div className="min-h-screen healthcare-mountain-bg-alt3">
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
              <Link to="/services" className="healthcare-nav-link-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all duration-300">
                Services
              </Link>
              <Link to="/contact" className="healthcare-nav-link-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-3 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300">
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
                <Link to="/services" className="healthcare-nav-link-mobile-redesigned text-xl font-semibold text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link to="/contact" className="healthcare-nav-link-mobile-redesigned active text-xl font-semibold text-gray-900 hover:text-teal-600 px-6 py-4 rounded-xl bg-teal-50 border-2 border-teal-200 transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
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
          <span className="text-blue-600">Contact Us</span>
        </div>
      </div>

      {/* Hero Section - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 healthcare-glass-overlay p-8 rounded-3xl">
            <h1 className="text-4xl lg:text-5xl healthcare-heading-enhanced mb-6">
              Contact <span className="text-teal-600">Us</span>
            </h1>
            <p className="text-xl healthcare-text-enhanced max-w-3xl mx-auto">
              We're here to help with your healthcare needs. Reach out to us for appointments, 
              questions, or any assistance you may require.
            </p>
          </div>

          {/* Emergency Alert - Enhanced Glass Effect */}
          <div className="healthcare-glass-hero p-6 mb-12 border-l-4 border-red-500 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold healthcare-heading-enhanced text-red-800 mb-1">
                  Medical Emergency?
                </h3>
                <p className="healthcare-text-enhanced text-red-700 mb-2">
                  If you are experiencing a medical emergency, please call 911 immediately or visit our Emergency Department.
                </p>
                <a 
                  href={`tel:${HOSPITAL_BRANDING.contact.emergency}`}
                  className="inline-flex items-center gap-2 text-red-600 font-medium hover:text-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Emergency: {HOSPITAL_BRANDING.contact.emergency}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods - Enhanced Glass Effect */}
      <section className="py-16 healthcare-glass-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 healthcare-glass-overlay p-8 rounded-3xl">
            <h2 className="text-3xl lg:text-4xl healthcare-heading-enhanced mb-4">
              Get in Touch
            </h2>
            <p className="text-lg healthcare-text-enhanced max-w-2xl mx-auto">
              Choose the most convenient way to reach us. We're committed to providing 
              prompt and helpful responses to all inquiries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div 
                  key={index} 
                  className="healthcare-glass-card p-6 healthcare-hover-glow text-center rounded-3xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-teal-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold healthcare-heading-enhanced mb-2">
                    {method.title}
                  </h3>
                  
                  <p className="font-medium healthcare-text-enhanced mb-2">
                    {method.primary}
                  </p>
                  
                  <p className="healthcare-text-enhanced text-sm mb-4">
                    {method.secondary}
                  </p>
                  
                  <a 
                    href={method.action}
                    className="healthcare-btn-premium inline-block"
                  >
                    {method.actionText}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="healthcare-form">
              <h2 className="text-2xl healthcare-heading mb-6">Send Us a Message</h2>
              
              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Message sent successfully!</p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block healthcare-body font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="healthcare-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block healthcare-body font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="healthcare-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block healthcare-body font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="healthcare-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block healthcare-body font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="healthcare-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block healthcare-body font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="healthcare-input"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="appointment">Schedule Appointment</option>
                    <option value="general">General Information</option>
                    <option value="billing">Billing Question</option>
                    <option value="medical">Medical Records</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block healthcare-body font-medium mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <span className="healthcare-body">Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <span className="healthcare-body">Phone</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block healthcare-body font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="healthcare-input resize-none"
                    placeholder="Please describe how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="healthcare-btn-primary w-full flex items-center justify-center gap-2"
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Operating Hours */}
              <div className="healthcare-glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-semibold healthcare-heading">Operating Hours</h3>
                </div>
                <div className="space-y-3">
                  {operatingHours.map((schedule, index) => (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center py-2 ${
                        schedule.highlight ? 'bg-red-50 px-3 rounded-lg border border-red-200' : ''
                      }`}
                    >
                      <span className={`healthcare-body ${schedule.highlight ? 'text-red-800 font-medium' : ''}`}>
                        {schedule.day}
                      </span>
                      <span className={`font-medium ${schedule.highlight ? 'text-red-600' : 'healthcare-heading'}`}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Contacts */}
              <div className="healthcare-glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-semibold healthcare-heading">Department Contacts</h3>
                </div>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="healthcare-body">{dept.name}</span>
                      <a 
                        href={`tel:${dept.phone}`}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
                      >
                        {dept.extension ? `Ext. ${dept.extension}` : 'Direct'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="healthcare-glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-semibold healthcare-heading">Location</h3>
                </div>
                <p className="healthcare-body mb-4">
                  {HOSPITAL_BRANDING.contact.address}
                </p>
                <div className="space-y-2 text-sm healthcare-body">
                  <p>• Free parking available</p>
                  <p>• Wheelchair accessible</p>
                  <p>• Public transportation nearby</p>
                  <p>• Valet parking for patients</p>
                </div>
                <button className="healthcare-btn-secondary mt-4 w-full">
                  Get Directions
                </button>
              </div>

              {/* Quick Actions */}
              <div className="healthcare-glass-card p-6">
                <h3 className="text-xl font-semibold healthcare-heading mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/login?role=patient"
                    className="block w-full healthcare-btn-primary text-center"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Schedule Appointment
                  </Link>
                  <Link 
                    to="/services"
                    className="block w-full healthcare-btn-secondary text-center"
                  >
                    <Heart className="w-4 h-4 inline mr-2" />
                    View Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 healthcare-bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl healthcare-heading mb-4">Find Us</h2>
            <p className="healthcare-body">
              Located in the heart of the city with easy access and ample parking.
            </p>
          </div>
          
          <div className="healthcare-glass-hero p-8 text-center">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive Map</p>
                <p className="text-sm text-gray-400">Map integration would be implemented here</p>
              </div>
            </div>
            <p className="healthcare-body">
              {HOSPITAL_BRANDING.contact.address}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean Minimalistic Style */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="healthcare-glass-card bg-white/10 p-8 rounded-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Get in Touch Today
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              We're here to help with all your healthcare needs. Contact us today to schedule 
              an appointment or get answers to your questions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login?role=patient" 
                className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Appointment
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              
              <a 
                href={`tel:${HOSPITAL_BRANDING.contact.phone}`}
                className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-6 py-3 font-semibold transform hover:scale-105 transition-all duration-300 rounded-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </span>
              </a>
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