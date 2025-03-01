import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">NextStep</Link>
      <div className="nav-links">
        <Link to="/mock-interview" className="nav-link">Mock Interview</Link>
        <Link to="#application-tracker" className="nav-link">Application Tracker</Link>
        <Link to="#about" className="nav-link">About</Link>
        <button
          className="nav-button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
      <div className="mobile-menu-button" onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/mock-interview" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Mock Interview</Link>
        <Link to="#application-tracker" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Application Tracker</Link>
        <Link to="#about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        <button
          className="nav-button mobile-nav-button"
          onClick={() => {
            navigate('/login');
            setIsMobileMenuOpen(false);
          }}
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 