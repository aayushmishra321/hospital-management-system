import { useState, useEffect } from 'react';
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
  ChevronDown,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Calendar,
  UserCheck,
  Zap,
  Globe,
  TrendingUp,
  MessageCircle,
  Headphones
} from 'lucide-react';
import { HOSPITAL_BRANDING } from '../config/branding';
import { UniformImageCard } from '../components/shared/UniformImageCard';
import { getLandingImage, getDepartmentImage, getDashboardImage } from '../utils/unsplashImages';
import '../styles/glassmorphism.css';
import '../styles/animations.css';

export function PremiumLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleVisibility = () => {
      setIsVisible(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      icon: Shield,
      title: 'Emergency Care',
      description: '24/7 emergency services with state-of-the-art trauma facilities and expert emergency physicians.',
      color: 'from-red-500 to-pink-600',
      image: getDepartmentImage('emergency'),
      features: ['24/7 Availability', 'Expert Staff', 'Advanced Equipment']
    },
    {
      icon: Baby,
      title: 'Pediatric Care',
      description: 'Comprehensive healthcare for children with specialized pediatric physicians and child-friendly facilities.',
      color: 'from-pink-500 to-rose-600',
      image: getDepartmentImage('pediatrics'),
      features: ['Child Specialists', 'Family-Centered Care', 'Play Therapy']
    },
    {
      icon: Heart,
      title: 'Cardiology',
      description: 'Advanced heart care including preventive cardiology, interventional procedures, and cardiac surgery.',
      color: 'from-blue-500 to-cyan-600',
      image: getDepartmentImage('cardiology'),
      features: ['Heart Surgery', 'Preventive Care', 'Cardiac Rehab']
    },
    {
      icon: Brain,
      title: 'Neurology',
      description: 'Cutting-edge neurological care for brain, spine, and nervous system disorders.',
      color: 'from-purple-500 to-indigo-600',
      image: getDepartmentImage('neurology'),
      features: ['Brain Surgery', 'Stroke Care', 'Neurotherapy']
    }
  ];

  const stats = [
    { number: '15K+', label: 'Patients Treated', icon: Users },
    { number: '150+', label: 'Medical Experts', icon: Stethoscope },
    { number: '25+', label: 'Departments', icon: Activity },
    { number: '99.9%', label: 'Success Rate', icon: Award }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Heart Surgery Patient',
      image: getDashboardImage('patient', 'main'),
      testimonial: 'The cardiac team saved my life with their expertise and compassionate care. I cannot thank them enough for their dedication.',
      rating: 5,
      location: 'New York'
    },
    {
      name: 'Michael Chen',
      role: 'Pediatric Patient Parent',
      image: getDashboardImage('patient', 'main'),
      testimonial: 'My daughter received exceptional care from the pediatric team. They made her feel comfortable throughout the entire treatment.',
      rating: 5,
      location: 'California'
    },
    {
      name: 'Emily Davis',
      role: 'Orthopedic Patient',
      image: getDashboardImage('patient', 'main'),
      testimonial: 'After my knee surgery, I can walk pain-free again. The rehabilitation team was amazing and very supportive.',
      rating: 5,
      location: 'Texas'
    }
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
      icon: Shield,
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
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock patient support for any questions or concerns.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-float"
          style={{
            left: mousePosition.x * 0.02 + 'px',
            top: mousePosition.y * 0.02 + 'px',
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-float-delayed"
          style={{
            right: mousePosition.x * -0.01 + 'px',
            bottom: mousePosition.y * -0.01 + 'px',
          }}
        />
      </div>

      {/* Emergency Banner */}
      <div className="relative z-50 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4" />
            🚨 EMERGENCY? Call {HOSPITAL_BRANDING.contact.phone} - Available 24/7
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* Premium Navigation */}
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled 
          ? 'glass-card shadow-2xl border-b border-white/20' 
          : 'bg-white/80 backdrop-blur-md shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Premium Logo */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="group-hover:scale-105 transition-transform duration-300">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                  {HOSPITAL_BRANDING.shortName}
                </h1>
                <p className="text-xs text-gray-500 font-medium">{HOSPITAL_BRANDING.tagline}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {['Home', 'Services', 'Departments', 'About', 'Contact'].map((item, index) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="relative text-gray-700 hover:text-cyan-600 font-medium transition-all duration-300 group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
              
              {/* Premium Login Button */}
              <div className="relative group">
                <button className="glass-button-premium flex items-center gap-2 group-hover:scale-105 transition-all duration-300">
                  <Shield className="w-4 h-4" />
                  Login Portal
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute right-0 mt-2 w-56 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-white/20 shadow-2xl">
                  <div className="py-2">
                    {[
                      { role: 'admin', label: 'Admin Portal', icon: Shield, color: 'from-slate-600 to-gray-700' },
                      { role: 'doctor', label: 'Doctor Portal', icon: Stethoscope, color: 'from-cyan-500 to-teal-600' },
                      { role: 'patient', label: 'Patient Portal', icon: Heart, color: 'from-blue-500 to-purple-600' },
                      { role: 'receptionist', label: 'Staff Portal', icon: UserCheck, color: 'from-purple-500 to-pink-600' }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link 
                          key={item.role}
                          to={`/login?role=${item.role}`} 
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-300 group/item"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-300" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass-button-premium p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 glass-card mt-2 rounded-xl border border-white/20">
              <div className="flex flex-col gap-4">
                {['Home', 'Services', 'Departments', 'About', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="text-gray-700 hover:text-cyan-600 font-medium transition-colors px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                
                <div className="border-t border-white/20 pt-4 px-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">Access Portal</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'admin', label: 'Admin', color: 'from-slate-600 to-gray-700' },
                      { role: 'doctor', label: 'Doctor', color: 'from-cyan-500 to-teal-600' },
                      { role: 'patient', label: 'Patient', color: 'from-blue-500 to-purple-600' },
                      { role: 'receptionist', label: 'Staff', color: 'from-purple-500 to-pink-600' }
                    ].map((item) => (
                      <Link 
                        key={item.role}
                        to={`/login?role=${item.role}`} 
                        className={`bg-gradient-to-r ${item.color} text-white px-3 py-2 rounded-lg text-sm text-center font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-cyan-700">
                  <Sparkles className="w-4 h-4" />
                  Trusted by 15,000+ Patients
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-gray-900">Your Health,</span>
                  <span className="block bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Our Priority
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Experience world-class healthcare with cutting-edge technology, 
                  compassionate care, and a team of expert medical professionals 
                  dedicated to your well-being.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login?role=patient" 
                  className="group glass-button-premium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5 group-hover:animate-pulse" />
                    Book Appointment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                
                <button className="group glass-button-premium border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-400 hover:text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                  <span className="flex items-center justify-center gap-3">
                    <Play className="w-5 h-5 group-hover:animate-pulse" />
                    Watch Demo
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">15,000+ Happy Patients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className={`relative transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative group">
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 glass-card p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">99.9% Success Rate</p>
                      <p className="text-sm text-gray-600">Trusted Results</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 glass-card p-4 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">24/7 Available</p>
                      <p className="text-sm text-gray-600">Emergency Care</p>
                    </div>
                  </div>
                </div>

                <UniformImageCard
                  src={getLandingImage('hero')}
                  alt="Premium Healthcare"
                  height="h-96 lg:h-[600px]"
                  containerClassName="w-full rounded-3xl shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-500"
                  className="group-hover:scale-105 transition-transform duration-500"
                  overlay={true}
                  overlayClassName="bg-gradient-to-t from-black/20 via-transparent to-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Services Section */}
      <section id="services" className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
              <Stethoscope className="w-4 h-4" />
              Our Services
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              World-Class <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Healthcare</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive medical services delivered by expert healthcare professionals 
              using cutting-edge technology and compassionate care approaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index} 
                  className="group glass-card p-8 hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to="/login?role=patient"
                    className="inline-flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 group-hover:gap-3 transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
              <Zap className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Advanced <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Technology</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of healthcare with our innovative solutions and patient-centered approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group glass-card p-8 hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Testimonials Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
              <MessageCircle className="w-4 h-4" />
              Patient Stories
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              What Our <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Patients Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real patients who have experienced our exceptional healthcare services.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="glass-card p-8 lg:p-12 text-center">
              <div className="flex justify-center mb-6">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].testimonial}"
              </blockquote>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <UniformImageCard
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    height="h-16"
                    containerClassName="w-16"
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                  <p className="text-sm text-cyan-600">{testimonials[activeTestimonial].location}</p>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to Experience <br />
            <span className="text-cyan-200">Premium Healthcare?</span>
          </h2>
          <p className="text-xl text-cyan-100 mb-12 max-w-3xl mx-auto">
            Join thousands of satisfied patients who trust us with their health. 
            Book your appointment today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/login?role=patient" 
              className="glass-button-premium bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5" />
                Book Appointment Now
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            
            <Link 
              to="/register" 
              className="glass-button-premium border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-3">
                <UserCheck className="w-5 h-5" />
                Register Today
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{HOSPITAL_BRANDING.shortName}</h3>
                  <p className="text-cyan-400">{HOSPITAL_BRANDING.tagline}</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                {HOSPITAL_BRANDING.description}
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: HOSPITAL_BRANDING.social.facebook },
                  { icon: Twitter, href: HOSPITAL_BRANDING.social.twitter },
                  { icon: Instagram, href: HOSPITAL_BRANDING.social.instagram },
                  { icon: Linkedin, href: HOSPITAL_BRANDING.social.linkedin }
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={index}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 group"
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <div className="space-y-3">
                {['About Us', 'Services', 'Departments', 'Doctors', 'Contact'].map((link) => (
                  <a key={link} href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-400">{HOSPITAL_BRANDING.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-400">{HOSPITAL_BRANDING.contact.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                  <span className="text-gray-400">{HOSPITAL_BRANDING.contact.address}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">
                © 2024 {HOSPITAL_BRANDING.name}. All rights reserved.
              </p>
              <div className="flex gap-6">
                {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map((link) => (
                  <a key={link} href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}