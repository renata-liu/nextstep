import './HomePage.css';

const HomePage = () => {
  return (
    <>
      <div className="App">
        <main className="main-content">
          <section className="hero-section">
            <h1>Your next job, one step away</h1>
            <p className="subtitle">Streamline your job search with smart interview preparation and application tracking</p>
            <button className="hero-btn">Get Started</button>
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
        </main>
      </div>
    </>
  );
};

export default HomePage;