import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">JobPrep Pro</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <main className="main-content">
        <section className="hero-section">
          <h1>Master Your Job Search Journey</h1>
          <p className="subtitle">Your all-in-one platform for interview preparation and application tracking</p>
        </section>

        <section className="features-section" id="features">
          <div className="feature-card interview-prep">
            <h2>Mock Interview Prep</h2>
            <p>Practice with AI-powered mock interviews tailored to your industry</p>
            <ul>
              <li>Common interview questions</li>
              <li>Real-time feedback</li>
              <li>Industry-specific scenarios</li>
            </ul>
            <button className="feature-btn">Start Practice</button>
          </div>

          <div className="feature-card application-tracker">
            <h2>Application Tracker</h2>
            <p>Stay organized with our intuitive job application management system</p>
            <ul>
              <li>Track application status</li>
              <li>Set reminders</li>
              <li>Analytics dashboard</li>
            </ul>
            <button className="feature-btn">Track Applications</button>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Level Up Your Job Search?</h2>
          <button className="cta-btn">Get Started</button>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 JobPrep Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
