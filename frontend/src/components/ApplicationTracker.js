import React, { useState, useEffect } from 'react';
import './ApplicationTracker.css';

const ApplicationTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status and fetch applications if authenticated
    checkAuthAndFetchApplications();
  }, []);

  const checkAuthAndFetchApplications = async () => {
    try {
      // TODO: Replace with actual auth check endpoint
      const authResponse = await fetch('/api/auth/check');
      const authData = await authResponse.json();
      
      setIsAuthenticated(authData.isAuthenticated);

      if (authData.isAuthenticated) {
        // Fetch applications if user is authenticated
        const applicationsResponse = await fetch('/api/applications');
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="application-tracker">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="application-tracker">
        <div className="auth-message">
          <h2>Login Required</h2>
          <p>You must be logged in to track applications.</p>
          <button className="login-button">Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="application-tracker">
      <header className="tracker-header">
        <h1>Application Tracker</h1>
        <button className="add-application-btn">+ Add Application</button>
      </header>

      <div className="applications-grid">
        {applications.length === 0 ? (
          <div className="no-applications">
            <p>No applications yet. Start tracking your job applications!</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="company-header">
                <h3>{app.company}</h3>
                <span className={`status-badge ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>
              <h4>{app.position}</h4>
              <div className="application-details">
                <p>
                  <strong>Location:</strong> {app.location || 'Not specified'}
                </p>
                <p>
                  <strong>Type:</strong> {app.remoteStatus}
                </p>
                {app.appliedDate && (
                  <p>
                    <strong>Applied:</strong>{' '}
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="card-actions">
                <button className="edit-btn">Edit</button>
                <button className="view-btn">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker; 