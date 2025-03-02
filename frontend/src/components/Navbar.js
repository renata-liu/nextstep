import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">NextStep</Link>
      <div className="nav-links">
        <Link to="/mock-interview" className="nav-link">Mock Interview</Link>
        {authenticated ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button
              className="nav-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="nav-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
      <div className="mobile-menu-button" onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/mock-interview" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Mock Interview</Link>
        {authenticated ? (
          <>
            <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
            <button
              className="nav-button mobile-nav-button"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="nav-button mobile-nav-button"
            onClick={() => {
              navigate('/login');
              setIsMobileMenuOpen(false);
            }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 