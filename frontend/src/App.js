import React, { useState } from 'react';
import './App.css';
import MockInterview from './components/MockInterview';
import HomePage from './components/HomePage';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">NextStep</div>
        <div className="nav-links">
          <a href="#features">Mock Interview</a>
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
          <a href="#features">Mock Interview</a>
          <a href="#application-tracker">Application Tracker</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <main className="main-content">
        <HomePage />
      </main>

      <footer className="footer">
        <p>&copy; 2024 NextStep. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
