import React, { useState, useEffect } from 'react';
import './Home.css'; 
import { 
  FaUserMd, 
  FaAmbulance, 
  FaHeartbeat, 
  FaHandHoldingHeart, 
  FaSun, 
  FaMoon,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaShieldAlt,
  FaAward,
  FaSmile,
  FaArrowRight,
  FaVideo,
  FaCalendarCheck,
} from 'react-icons/fa';

export default function Home() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const services = [
    { title: "Doctor Appointment", desc: "Book appointments with top specialists", icon: <FaUserMd />, delay: "0.1s" },
    { title: "Blood Bank", desc: "24/7 blood availability with rapid delivery", icon: <FaHeartbeat />, delay: "0.2s" },
    { title: "Ambulance 🚑", desc: "Quick response emergency service", icon: <FaAmbulance />, delay: "0.3s" },
    { title: "Organ Donor", desc: "Save lives through organ donation", icon: <FaHandHoldingHeart />, delay: "0.4s" },
    { title: "Telemedicine", desc: "Video consultation with doctors", icon: <FaVideo />, delay: "0.5s" },
    { title: "Health Checkup", desc: "Comprehensive health packages", icon: <FaHeartbeat />, delay: "0.6s" },
  ];

  const features = [
    { icon: <FaShieldAlt />, title: "100% Safe", desc: "Certified & Safe Treatment" },
    { icon: <FaAward />, title: "Award Winning", desc: "Best Hospital 2024" },
    { icon: <FaSmile />, title: "Happy Patients", desc: "10,000+ Success Stories" },
    { icon: <FaStar />, title: "5 Star Rating", desc: "Patient Satisfaction" }
  ];

  const testimonials = [
    { name: "Rajesh Sharma", text: "Excellent service! The doctors are very professional and caring.", rating: 5, role: "Patient" },
    { name: "Priya Patel", text: "Best hospital in the city. Great infrastructure and staff behavior.", rating: 5, role: "Patient" },
    { name: "Amit Kumar", text: "Quick ambulance service and emergency care saved my father's life.", rating: 5, role: "Family Member" }
  ];

  return (
    <div className="hms-container">
      
      {/* Theme Toggle Button */}
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-float"></div>
        <div className="floating-float2"></div>
        <div className="floating-float3"></div>
      </div>

      {/* Hero Section with 3D Effect */}
      <div className="hero-wrapper">
        <div className="hero-overlay"></div>
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <div className="badge-group">
                <span className="badge-text">🌟 India's Most Trusted Hospital </span>
                <span className="badge-text2">🏆 NABH Accredited</span>
              </div>
              <h1 className="title">
                Ganpati  
                <span className="highlight">  Hospital</span>
              </h1>
              <p className="subtitle">
                Experience world-class healthcare with personalized attention and advanced medical technology.
              </p>
              
              <div className="hero-stats">
                <div className="hero-stat">
                  <h4>50+</h4>
                  <p>Expert Doctors</p>
                </div>
                <div className="hero-stat">
                  <h4>100+</h4>
                  <p>Hospital Beds</p>
                </div>
                <div className="hero-stat">
                  <h4>24/7</h4>
                  <p>Emergency</p>
                </div>
              </div>

              <div className="hero-buttons">
                <button className="btn-primary">
                  Book Appointment <FaArrowRight />
                </button>
                <button className="btn-secondary">
                  Emergency: 102
                </button>
              </div>

              <div className="quick-info">
                <div className="info-item">
                  <FaClock className="info-icon" />
                  <span>24/7 Available</span>
                </div>
                <div className="info-item">
                  <FaPhoneAlt className="info-icon" />
                  <span>+91 102</span>
                </div>
                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <span>Multi-Speciality</span>
                </div>
              </div>
            </div>
            
            <div className="hero-right">
              <div className="floating-card">
                <div className="emergency-card">
                  <div className="emergency-icon">🚑</div>
                  <h3>Emergency Help</h3>
                  <p>24/7 Available</p>
                  <div className="emergency-number">102</div>
                  <button className="emergency-btn">Call Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid with Unique Cards */}
      <div className="services-section">
        <div className="section-header">
          <span className="section-tag">Our Services</span>
          <h2>Comprehensive Healthcare <span className="highlight">Solutions</span></h2>
          <p>Advanced medical care with compassion and cutting-edge technology</p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card" style={{ animationDelay: service.delay }}>
              <div className="card-bg-effect"></div>
              <div className="icon-wrapper">
                {service.icon}
                <div className="icon-glow"></div>
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <div className="card-footer">
                <span className="learn-more">
                  Learn More <FaArrowRight />
                </span>
              </div>
              <div className="card-number">0{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="section-header">
          <span className="section-tag">Testimonials</span>
          <h2>What Our <span className="highlight">Patients Say</span></h2>
          <p>Real stories from people we've helped</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <h4>{testimonial.name}</h4>
              <span className="testimonial-role">{testimonial.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Need Medical Assistance?</h2>
          <p>Book your appointment today and get personalized healthcare</p>
          <div className="cta-buttons">
            <button className="cta-primary">
              <FaCalendarCheck /> Book Appointment
            </button>
            
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <p>Expert Doctors</p>
            <div className="stat-bar"></div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <p>Hospital Beds</p>
            <div className="stat-bar"></div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <p>Emergency Service</p>
            <div className="stat-bar"></div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10k+</div>
            <p>Happy Patients</p>
            <div className="stat-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}