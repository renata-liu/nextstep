import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">NextStep</Link>
      <div className="nav-links">
        <Link to="/mock-interview">Mock Interview</Link>
        <a href="#application-tracker">Application Tracker</a>
        <a href="#about">About</a>
        <button className="login-btn">Login</button>
      </div>
      <div className="kebab-menu" onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/mock-interview" onClick={() => setIsMobileMenuOpen(false)}>Mock Interview</Link>
        <a href="#application-tracker" onClick={() => setIsMobileMenuOpen(false)}>Application Tracker</a>
        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
        <button className="login-btn">Login</button>
      </div>
    </nav>
  );
};

export default Navbar; 