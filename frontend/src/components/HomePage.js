import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  };

  const goToMockInterview = () => {
    navigate('/mock-interview');
  };

  return (
    <>
      <section className="hero-section">
        <h1>NextStep</h1>
        <h2>Your next job, one step away</h2>
        <p className="subtitle">Streamline your job search with smart interview preparation and application tracking</p>
        <button className="hero-btn" onClick={scrollToFeatures}>Get Started</button>
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
          <button className="feature-btn" onClick={goToMockInterview}>Start Practice</button>
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
    </>
  );
};

export default HomePage;