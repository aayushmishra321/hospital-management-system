import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Menu,
  X,
  Shield,
  Users,
  Heart,
  Brain,
  Baby,
  Stethoscope,
  Activity,
  Clock,
  Award,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import { ServiceCard, DepartmentCard, DoctorCard, TestimonialCard, UniformImageCard } from '../components/shared/UniformImageCard';
import { getSmartImage, getDepartmentImage, getRoleDashboardImage } from '../utils/unsplashImages';
import '../styles/imageCard.css';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setScrolled(scrollY > 50);
  }, []);

  useEffect(() => {
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  const services = [
    {
      icon: Shield,
      title: 'Emergency Department',
      description: '24/7 emergency care with state-of-the-art trauma facilities and expert emergency physicians ready to handle any medical crisis.',
      color: 'bg-red-500',
      image: getDepartmentImage('emergency')
    },
    {
      icon: Baby,
      title: 'Pediatric Department',
      description: 'Comprehensive healthcare for children from infancy through adolescence with specialized pediatric physicians and child-friendly facilities.',
      color: 'bg-pink-500',
      image: getDepartmentImage('pediatrics')
    },
    {
      icon: Stethoscope,
      title: 'General Medicine',
      description: 'Primary healthcare services including preventive care, health screenings, and treatment of common medical conditions.',
      color: 'bg-green-500',
      image: getDepartmentImage('orthopedics')
    },
    {
      icon: Brain,
      title: 'Neurology Department',
      description: 'Advanced neurological care for brain, spine, and nervous system disorders with cutting-edge diagnostic and treatment options.',
      color: 'bg-purple-500',
      image: getDepartmentImage('neurology')
    },
    {
      icon: Heart,
      title: 'Cardiology Department',
      description: 'Comprehensive heart and cardiovascular care including preventive cardiology, interventional procedures, and cardiac surgery.',
      color: 'bg-blue-500',
      image: getDepartmentImage('cardiology')
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Patients' },
    { number: '50+', label: 'Expert Doctors' },
    { number: '15+', label: 'Departments' },
    { number: '24/7', label: 'Emergency Service' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 text-white py-2 px-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6 animate-fade-in-left">
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <Phone className="w-4 h-4" />
              <span>{HOSPITAL_BRANDING.contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <Mail className="w-4 h-4" />
              <span>{HOSPITAL_BRANDING.contact.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-fade-in-right">
            <a href={HOSPITAL_BRANDING.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300">
              <Facebook className="w-4 h-4 hover:text-cyan-200 cursor-pointer" />
            </a>
            <a href={HOSPITAL_BRANDING.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300">
              <Twitter className="w-4 h-4 hover:text-cyan-200 cursor-pointer" />
            </a>
            <a href={HOSPITAL_BRANDING.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300">
              <Instagram className="w-4 h-4 hover:text-cyan-200 cursor-pointer" />
            </a>
            <a href={HOSPITAL_BRANDING.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300">
              <Linkedin className="w-4 h-4 hover:text-cyan-200 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-100' 
          : 'bg-white/90 backdrop-blur-sm shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {HOSPITAL_BRANDING.shortName}
                </h1>
                <p className="text-xs text-gray-500">{HOSPITAL_BRANDING.tagline}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Contact', path: '/contact' }
              ].map((item) => {
                const isActive = window.location.pathname === item.path;
                return (
                  <div key={item.name} className="relative group flex items-center">
                    <Link 
                      to={item.path}
                      className="text-gray-700 hover:text-cyan-500 font-medium transition-colors duration-200 px-3 py-2 inline-flex items-center"
                    >
                      {item.name}
                    </Link>
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}></span>
                  </div>
                );
              })}
              
              <div className="flex items-center ml-4">
                <Link 
                  to="/login?role=patient" 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Patient Portal
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'About', path: '/about' },
                  { name: 'Services', path: '/services' },
                  { name: 'Contact', path: '/contact' }
                ].map((item) => {
                  const isActive = window.location.pathname === item.path;
                  return (
                    <Link 
                      key={item.name}
                      to={item.path}
                      className={`font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                        isActive 
                          ? 'text-cyan-600 bg-cyan-50' 
                          : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                
                <Link 
                  to="/login?role=patient" 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors duration-200 text-center mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Patient Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-purple-100 via-white to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Simplified */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight">
                  <span className="inline-block">Your Partner In</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">
                    Health and Wellness
                  </span>
                </h1>
                <p className="text-lg text-gray-600 mt-6 leading-relaxed">
                  Expert medical care with compassion and cutting-edge technology.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login?role=patient" 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-4 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors duration-200 font-medium text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5" />
                    Book an Appointment
                  </span>
                </Link>
                <Link 
                  to="/services" 
                  className="border-2 border-cyan-400 text-cyan-600 px-8 py-4 rounded-lg hover:bg-cyan-400 hover:text-white transition-colors duration-200 font-medium text-center"
                >
                  Explore Services
                </Link>
              </div>

              {/* Trust Indicators Above the Fold */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">15+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">NABH Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">50+ Specialists</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                  >
                    <div className="text-2xl lg:text-3xl font-bold text-cyan-500">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Keep Background Image Only */}
            <div className="relative lg:ml-8">
              {/* Remove duplicate image card - keep only background */}
            </div>
          </div>

          {/* Moved floating elements below the hero content */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">24/7 Emergency Care</h3>
                <p className="text-sm text-gray-600">Round-the-clock medical assistance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Certified Excellence</h3>
                <p className="text-sm text-gray-600">Accredited healthcare facility</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Guided by our core values and commitment to excellence in healthcare delivery
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Mission */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-left border border-cyan-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {HOSPITAL_BRANDING.mission}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-right border border-purple-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {HOSPITAL_BRANDING.vision}
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="animate-fade-in-up animation-delay-500">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Core Values</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HOSPITAL_BRANDING.values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-purple-50 via-cyan-50/50 to-purple-50/50 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Our Healthcare Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive medical services delivered by our expert healthcare professionals 
              using state-of-the-art technology and compassionate care approaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  image={service.image}
                  icon={service.icon}
                  color={service.color}
                  link="/login?role=patient"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Showcase Section */}
      <section id="departments" className="py-20 bg-gradient-to-br from-white via-purple-50/20 to-cyan-50/30 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-cyan-200/20 to-purple-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Our Medical Departments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare services across multiple specialties with state-of-the-art facilities and expert medical professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { name: 'Cardiology', image: getDepartmentImage('cardiology'), icon: Heart, color: 'bg-red-500' },
              { name: 'Neurology', image: getDepartmentImage('neurology'), icon: Brain, color: 'bg-teal-500' },
              { name: 'Pediatrics', image: getDepartmentImage('pediatrics'), icon: Baby, color: 'bg-emerald-500' },
              { name: 'Orthopedics', image: getDepartmentImage('orthopedics'), icon: Activity, color: 'bg-cyan-500' },
              { name: 'Dermatology', image: getDepartmentImage('dermatology'), icon: Stethoscope, color: 'bg-green-500' },
              { name: 'ENT', image: getDepartmentImage('ent'), icon: Users, color: 'bg-slate-500' },
              { name: 'Oncology', image: getDepartmentImage('oncology'), icon: Shield, color: 'bg-stone-500' },
              { name: 'Radiology', image: getDepartmentImage('radiology'), icon: Activity, color: 'bg-teal-600' },
              { name: 'Therapy', image: getDepartmentImage('physiotherapy'), icon: Heart, color: 'bg-emerald-600' }
            ].map((dept, index) => (
              <div 
                key={index} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DepartmentCard
                  name={dept.name}
                  image={dept.image}
                  icon={dept.icon}
                  color={dept.color}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in-up animation-delay-1000">
            <Link 
              to="/login?role=admin" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
            >
              <Users className="w-5 h-5 group-hover:animate-pulse" />
              Manage Departments
              <Activity className="w-4 h-4 group-hover:animate-pulse" />
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">Find What You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search for doctors, departments, or services to get the care you need.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-8 border border-purple-100">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctors</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter doctor name or specialty"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                    <button className="absolute right-2 top-2 bg-cyan-500 text-white p-2 rounded-md hover:bg-purple-600 transition-colors">
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300">
                    <option value="">All Departments</option>
                    {HOSPITAL_BRANDING.departments.map((dept, index) => (
                      <option key={index} value={dept.toLowerCase()}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300">
                    <option value="">All Services</option>
                    <option value="consultation">Consultation</option>
                    <option value="emergency">Emergency</option>
                    <option value="surgery">Surgery</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="therapy">Therapy</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Link 
                  to="/login?role=patient" 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center gap-2 transform hover:scale-105"
                >
                  <Users className="w-5 h-5" />
                  Search & Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <UniformImageCard
                src={getSmartImage({ page: 'about' })}
                alt="About Hospital"
                height="h-96 lg:h-[500px]"
                containerClassName="w-full rounded-2xl shadow-lg"
                fallbackSrc={getRoleDashboardImage('patient')}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent">About {HOSPITAL_BRANDING.shortName}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {HOSPITAL_BRANDING.mission}
              </p>
              <div className="space-y-4">
                {HOSPITAL_BRANDING.values.slice(0, 3).map((value, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
              
              {/* Stats moved here instead of overlaying image */}
              <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl p-6 mt-8 border border-cyan-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-500">15+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">500+</div>
                    <div className="text-sm text-gray-600">Happy Patients</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">50+</div>
                    <div className="text-sm text-gray-600">Expert Doctors</div>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/login?role=patient" 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 inline-block transform hover:scale-105"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-gradient-to-br from-cyan-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">Meet Our Expert Doctors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team of highly qualified and experienced medical professionals are dedicated to providing you with the best healthcare services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: 'Dr. Sarah Johnson', 
                specialty: 'Cardiologist', 
                image: getRoleDashboardImage('doctor'),
                experience: '15+ Years',
                description: 'Specialized in heart diseases and cardiovascular surgery'
              },
              { 
                name: 'Dr. Michael Chen', 
                specialty: 'Neurologist', 
                image: getRoleDashboardImage('doctor'),
                experience: '12+ Years',
                description: 'Expert in brain and nervous system disorders'
              },
              { 
                name: 'Dr. Emily Davis', 
                specialty: 'Pediatrician', 
                image: getRoleDashboardImage('doctor'),
                experience: '10+ Years',
                description: 'Dedicated to children\'s health and development'
              }
            ].map((doctor, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <DoctorCard
                  name={doctor.name}
                  specialty={doctor.specialty}
                  image={doctor.image}
                  experience={doctor.experience}
                  description={doctor.description}
                  link="/login?role=patient"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/login?role=admin" 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium inline-block transform hover:scale-105"
            >
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Patient Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">What Our Patients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real patients who have experienced our exceptional healthcare services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'John Smith',
                condition: 'Heart Surgery Patient',
                image: getRoleDashboardImage('patient'),
                testimonial: 'The cardiac team at HealthCare Excellence saved my life. Their expertise and compassionate care made all the difference.',
                rating: 5
              },
              {
                name: 'Maria Garcia',
                condition: 'Pediatric Care',
                image: getRoleDashboardImage('patient'),
                testimonial: 'My daughter received excellent care from the pediatric team. They made her feel comfortable throughout the treatment.',
                rating: 5
              },
              {
                name: 'David Wilson',
                condition: 'Orthopedic Surgery',
                image: getRoleDashboardImage('patient'),
                testimonial: 'After my knee surgery, I can walk pain-free again. The rehabilitation team was amazing and supportive.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <TestimonialCard
                  name={testimonial.name}
                  image={testimonial.image}
                  testimonial={testimonial.testimonial}
                  rating={testimonial.rating}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-cyan-500 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Ready to take the next step? Contact us today to schedule an appointment 
              or learn more about our services.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 animate-fade-in-left">
              <div className="grid md:grid-cols-1 gap-6">
                {[
                  {
                    icon: Phone,
                    title: 'Call Us',
                    info: HOSPITAL_BRANDING.contact.phone,
                    subtitle: `Available ${HOSPITAL_BRANDING.hours.emergency}`,
                    delay: '0ms'
                  },
                  {
                    icon: Mail,
                    title: 'Email Us',
                    info: HOSPITAL_BRANDING.contact.email,
                    subtitle: "We'll respond within 24 hours",
                    delay: '200ms'
                  },
                  {
                    icon: MapPin,
                    title: 'Visit Us',
                    info: HOSPITAL_BRANDING.contact.address,
                    subtitle: `Open ${HOSPITAL_BRANDING.hours.weekdays}`,
                    delay: '400ms'
                  }
                ].map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 group animate-fade-in-up"
                      style={{ animationDelay: contact.delay }}
                    >
                      <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Icon className="w-8 h-8 group-hover:animate-pulse" />
                      </div>
                      <div className="group-hover:translate-x-2 transition-transform duration-300">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-200 transition-colors duration-300">
                          {contact.title}
                        </h3>
                        <p className="text-cyan-100 group-hover:text-white transition-colors duration-300">
                          {contact.info}
                        </p>
                        <p className="text-cyan-200 text-sm">{contact.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl animate-fade-in-right hover:bg-white/15 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 animate-pulse" />
                Send us a Message
              </h3>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for your message! We will contact you soon.');
              }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                      placeholder="John"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                    placeholder="john.doe@email.com"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    Subject
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                  >
                    <option value="" className="text-gray-800">Select a subject</option>
                    <option value="appointment" className="text-gray-800">Schedule Appointment</option>
                    <option value="emergency" className="text-gray-800">Emergency Inquiry</option>
                    <option value="general" className="text-gray-800">General Information</option>
                    <option value="billing" className="text-gray-800">Billing Question</option>
                    <option value="feedback" className="text-gray-800">Feedback</option>
                  </select>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    Message
                  </label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none focus:bg-white/25 transition-all duration-300 hover:bg-white/25"
                    placeholder="Please describe how we can help you..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="group w-full bg-white text-cyan-600 py-3 rounded-lg font-medium hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5 group-hover:animate-pulse" />
                  Send Message
                  <Activity className="w-4 h-4 group-hover:animate-pulse" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Health Tips</h2>
          <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest health tips, medical news, and updates from {HOSPITAL_BRANDING.shortName}.
          </p>
          
          <div className="max-w-md mx-auto">
            <form className="flex gap-4" onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing! You will receive our health newsletter.');
            }}>
              <input 
                type="email" 
                required
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              />
              <button 
                type="submit"
                className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-medium hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-cyan-200 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{HOSPITAL_BRANDING.shortName}</h3>
                  <p className="text-xs text-gray-400">{HOSPITAL_BRANDING.tagline}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {HOSPITAL_BRANDING.description}
              </p>
              <div className="flex gap-4">
                <a href={HOSPITAL_BRANDING.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={HOSPITAL_BRANDING.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href={HOSPITAL_BRANDING.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={HOSPITAL_BRANDING.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-white text-sm transition-colors">Home</Link>
                <Link to="/about" className="block text-gray-400 hover:text-white text-sm transition-colors">About</Link>
                <Link to="/services" className="block text-gray-400 hover:text-white text-sm transition-colors">Services</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white text-sm transition-colors">Contact</Link>
                <Link to="/login?role=patient" className="block text-gray-400 hover:text-white text-sm transition-colors">Patient Portal</Link>
                <Link to="/register" className="block text-gray-400 hover:text-white text-sm transition-colors">Register</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Medical Services</h4>
              <div className="space-y-2">
                {HOSPITAL_BRANDING.departments.slice(0, 6).map((dept, index) => (
                  <Link key={index} to="/services" className="block text-gray-400 hover:text-white text-sm transition-colors">{dept}</Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400 text-sm">{HOSPITAL_BRANDING.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">{HOSPITAL_BRANDING.contact.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <span className="text-gray-400 text-sm">{HOSPITAL_BRANDING.contact.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">{HOSPITAL_BRANDING.hours.emergency}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h5 className="font-medium mb-2">Operating Hours</h5>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Weekdays: {HOSPITAL_BRANDING.hours.weekdays}</div>
                  <div>Weekends: {HOSPITAL_BRANDING.hours.weekends}</div>
                  <div className="text-red-400 font-medium">Emergency: {HOSPITAL_BRANDING.hours.emergency}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 {HOSPITAL_BRANDING.name}. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">HIPAA Compliance</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add custom CSS animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-left {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fade-in-right {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes float-delayed {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-30px);
    }
  }

  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes gradient-x {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fade-in-left 0.8s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fade-in-right 0.8s ease-out forwards;
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out forwards;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float-delayed 8s ease-in-out infinite;
    animation-delay: 2s;
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
  }

  .animation-delay-300 {
    animation-delay: 300ms;
  }

  .animation-delay-500 {
    animation-delay: 500ms;
  }

  .animation-delay-700 {
    animation-delay: 700ms;
  }

  .animation-delay-1000 {
    animation-delay: 1000ms;
  }

  .animate-fade-in {
    animation: fade-in-up 0.6s ease-out forwards;
  }

  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}