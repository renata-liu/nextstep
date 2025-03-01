import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">NextStep</Link>
      <div className="nav-links">
        <Link to="/mock-interview">Mock Interview</Link>
        <Link to="/application-tracker">Application Tracker</Link>
        <a href="#about">About</a>
        <button className="login-btn" onClick={handleLogin}>Login</button>
      </div>
      <div className="kebab-menu" onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/mock-interview" onClick={() => setIsMobileMenuOpen(false)}>Mock Interview</Link>
        <Link to="/application-tracker" onClick={() => setIsMobileMenuOpen(false)}>Application Tracker</Link>
        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
        <button className="login-btn" onClick={handleLogin}>Login</button>
      </div>
    </nav>
  );
};

export default Navbar; 