import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/auth';
import './Dashboard.css';

const Dashboard = () => {
    const [jobApplications, setJobApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = getUser();
    const API_URL = process.env.REACT_APP_API_URL;

    // Helper function to format salary
    const formatSalary = (salary) => {
        return salary || 'Salary not specified';
    };

    // Helper function to get status color class
    const getStatusClass = (status) => {
        const statusMap = {
            'Wishlist': 'wishlist',
            'Applied': 'applied',
            'Interview': 'interview',
            'Offer': 'offer',
            'Rejected': 'rejected',
            'Accepted': 'accepted'
        };
        return statusMap[status] || 'default';
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Log the request details
            console.log('Making request to:', API_URL);
            console.log('User ID:', user?._id);
            console.log('Token:', token);

            if (!token || !user?._id) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Fetch job applications with proper error handling
            const jobsResponse = await fetch(`${API_URL}/jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Add error check before parsing JSON
            if (jobsResponse.headers.get('content-type')?.includes('html')) {
                console.error('Received HTML instead of JSON. Backend might be down or wrong endpoint');
                throw new Error('Invalid server response. Please try again later.');
            }

            // Log the response details
            console.log('Jobs Response Status:', jobsResponse.status);
            const jobsData = await jobsResponse.json();
            console.log('Jobs Data:', jobsData);

            if (!jobsResponse.ok) {
                throw new Error(jobsData.message || 'Failed to fetch job applications');
            }

            // Fetch interviews with proper error handling
            const interviewsResponse = await fetch(`${API_URL}/interviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Add error check before parsing JSON
            if (interviewsResponse.headers.get('content-type')?.includes('html')) {
                console.error('Received HTML instead of JSON. Backend might be down or wrong endpoint');
                throw new Error('Invalid server response. Please try again later.');
            }

            // Log the response details
            console.log('Interviews Response Status:', interviewsResponse.status);
            const interviewsData = await interviewsResponse.json();
            console.log('Interviews Data:', interviewsData);

            if (!interviewsResponse.ok) {
                throw new Error(interviewsData.message || 'Failed to fetch interviews');
            }

            setJobApplications(jobsData);
            setInterviews(interviewsData);
            setError(null);
        } catch (err) {
            const errorMessage = `Failed to fetch user data: ${err.message}`;
            console.error('Dashboard fetch error:', {
                error: err,
                API_URL,
                userId: user?._id,
                hasToken: !!localStorage.getItem('token')
            });
            setError(errorMessage);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        setRefreshing(false);
    };

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (!API_URL) {
            console.error('API_URL is not defined in environment variables');
            setError('API configuration error');
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            await fetchUserData();
            setLoading(false);
        };

        loadInitialData();
    }, [navigate, user?._id, API_URL]);

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={handleRefresh} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user?.email}</h1>
            </header>

            <div className="dashboard-sections">
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Job Applications</h2>
                        <button
                            onClick={handleRefresh}
                            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
                            disabled={refreshing}
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                            <svg className="refresh-icon" viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>
                    {jobApplications.length === 0 ? (
                        <div className="empty-state">
                            <p>No job applications yet.</p>
                            <p className="extension-note">
                                Use our Chrome extension to automatically add applications from Indeed and Glassdoor!
                            </p>
                            <button onClick={() => navigate('/new-application')} className="add-button">
                                Add Application Manually
                            </button>
                        </div>
                    ) : (
                        <div className="applications-grid">
                            {jobApplications.map(job => (
                                <div key={job._id} className="application-card">
                                    <h3>{job.company}</h3>
                                    <p className="position">{job.position}</p>
                                    <div className={`status-badge ${getStatusClass(job.status)}`}>
                                        {job.status}
                                    </div>
                                    {job.salary && (
                                        <p className="salary">
                                            <span className="icon">💰</span>
                                            {formatSalary(job.salary)}
                                        </p>
                                    )}
                                    <p className="location">
                                        <span className="icon">📍</span>
                                        {job.location || 'Location not specified'}
                                    </p>
                                    <p className="remote-status">
                                        <span className="icon">🏢</span>
                                        {job.remoteStatus}
                                    </p>
                                    <p className="date">
                                        <span className="icon">📅</span>
                                        Applied: {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'Not applied yet'}
                                    </p>
                                    {job.deadlines && job.deadlines.length > 0 && (
                                        <div className="deadlines">
                                            <p className="deadline-title">
                                                <span className="icon">⏰</span>
                                                Upcoming Deadlines:
                                            </p>
                                            {job.deadlines.map((deadline, index) => (
                                                <p key={index} className="deadline-item">
                                                    {deadline.title}: {new Date(deadline.date).toLocaleDateString()}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => navigate(`/application/${job._id}`)}
                                        className="view-button"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-section">
                    <h2>Mock Interviews</h2>
                    {interviews.length === 0 ? (
                        <div className="empty-state">
                            <p>No mock interviews completed yet.</p>
                            <button onClick={() => navigate('/mock-interview')} className="add-button">
                                Start Your First Interview
                            </button>
                        </div>
                    ) : (
                        <div className="interviews-grid">
                            {interviews.map(interview => (
                                <div key={interview._id} className="interview-card">
                                    <h3>Interview Session</h3>
                                    <p className="date">
                                        <span className="icon">📅</span>
                                        {new Date(interview.date).toLocaleDateString()}
                                    </p>
                                    {interview.jobApplicationId && (
                                        <p className="job-link">
                                            <span className="icon">🔗</span>
                                            Linked to job application
                                        </p>
                                    )}
                                    <div className="interview-stats">
                                        <p className="questions-count">
                                            <span className="icon">❓</span>
                                            Questions: {interview.questions?.length || 0}
                                        </p>
                                        {interview.overallAnalysis && (
                                            <>
                                                <p className="score">
                                                    <span className="icon">📊</span>
                                                    Score: {interview.overallAnalysis.score || 'N/A'}
                                                </p>
                                                {interview.overallAnalysis.keyInsights && (
                                                    <div className="key-insights">
                                                        <p>Key Insights:</p>
                                                        <ul>
                                                            {interview.overallAnalysis.keyInsights.slice(0, 2).map((insight, index) => (
                                                                <li key={index}>{insight}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/interview/${interview._id}`)}
                                        className="view-button"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard; 