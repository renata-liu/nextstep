import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/auth';
import './Dashboard.css';

const Dashboard = () => {
    const [jobApplications, setJobApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('appliedDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
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

    // Sort and filter jobs
    const getSortedAndFilteredJobs = () => {
        let filteredJobs = [...jobApplications];

        // Apply status filter
        if (statusFilter !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.status.toLowerCase() === statusFilter);
        }

        // Apply sorting
        filteredJobs.sort((a, b) => {
            switch (sortBy) {
                case 'appliedDate':
                    const dateA = a.appliedDate ? new Date(a.appliedDate) : new Date(0);
                    const dateB = b.appliedDate ? new Date(b.appliedDate) : new Date(0);
                    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                case 'company':
                    return sortOrder === 'desc'
                        ? b.company.localeCompare(a.company)
                        : a.company.localeCompare(b.company);
                case 'status':
                    return sortOrder === 'desc'
                        ? b.status.localeCompare(a.status)
                        : a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        return filteredJobs;
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = getUser();

            // Debug authentication info
            console.log('=== Authentication Debug ===');
            console.log('Token exists:', !!token);
            console.log('User exists:', !!user);
            console.log('User ID:', user?._id);
            console.log('API URL:', API_URL);

            if (!token || !user?._id) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Construct full URLs
            const jobsUrl = `${API_URL}/jobs`;
            const interviewsUrl = `${API_URL}/interviews`;

            // Debug request details
            console.log('\n=== Request Debug ===');
            console.log('Jobs URL:', jobsUrl);
            console.log('Interviews URL:', interviewsUrl);
            console.log('Headers:', {
                'Authorization': `Bearer ${token.substring(0, 10)}...`,
                'Content-Type': 'application/json'
            });

            // Fetch job applications with proper error handling
            const jobsResponse = await fetch(jobsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Debug response details
            console.log('\n=== Response Debug ===');
            console.log('Response status:', jobsResponse.status);
            console.log('Response headers:', {
                'content-type': jobsResponse.headers.get('content-type'),
                'content-length': jobsResponse.headers.get('content-length')
            });

            // Check for non-JSON response
            const contentType = jobsResponse.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
                console.error('Received non-JSON response:', contentType);
                const text = await jobsResponse.text();
                console.error('Response text:', text);
                throw new Error('Invalid server response format');
            }

            const jobsData = await jobsResponse.json();

            // Debug response data
            console.log('\n=== Jobs Data Debug ===');
            console.log('Jobs count:', Array.isArray(jobsData) ? jobsData.length : 'Not an array');
            console.log('Jobs data structure:', jobsData);
            if (!Array.isArray(jobsData)) {
                console.error('Expected array but received:', typeof jobsData);
                console.error('Data:', jobsData);
            }

            if (!jobsResponse.ok) {
                throw new Error(jobsData.message || 'Failed to fetch job applications');
            }

            // Debug interviews request
            console.log('\n=== Interviews Request Debug ===');
            const interviewsResponse = await fetch(interviewsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Debug interviews response
            console.log('Interviews response status:', interviewsResponse.status);

            const interviewsData = await interviewsResponse.json();
            console.log('Interviews count:', Array.isArray(interviewsData) ? interviewsData.length : 'Not an array');

            if (!interviewsResponse.ok) {
                throw new Error(interviewsData.message || 'Failed to fetch interviews');
            }

            // Update state with fetched data
            console.log('\n=== State Update ===');
            console.log('Updating jobApplications with count:', Array.isArray(jobsData) ? jobsData.length : 0);
            console.log('Updating interviews with count:', Array.isArray(interviewsData) ? interviewsData.length : 0);

            setJobApplications(Array.isArray(jobsData) ? jobsData : []);
            setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
            setError(null);

        } catch (err) {
            console.error('\n=== Error Debug ===');
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                API_URL,
                userId: user?._id,
                hasToken: !!localStorage.getItem('token')
            });

            const errorMessage = `Failed to fetch user data: ${err.message}`;
            setError(errorMessage);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        setRefreshing(false);
    };

    const exportToGoogleSheets = () => {
        const sortedJobs = getSortedAndFilteredJobs();
        const csvContent = [
            // Headers
            ['Company', 'Position', 'Status', 'Location', 'Work Type', 'Salary', 'Applied Date', 'Next Deadline'].join(','),
            // Data rows
            ...sortedJobs.map(job => [
                job.company,
                job.position,
                job.status,
                job.location || 'Not specified',
                job.remoteStatus,
                job.salary ? `$${job.salary}` : 'Not specified',
                job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'Not applied',
                job.deadlines?.length > 0
                    ? `${job.deadlines[0].title}: ${new Date(job.deadlines[0].date).toLocaleDateString()}`
                    : 'No deadlines'
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        link.href = URL.createObjectURL(blob);
        link.download = `job_applications_${date}.csv`;
        link.click();
    };

    const exportToCalendar = (job) => {
        if (!job.deadlines || job.deadlines.length === 0) return;

        const deadline = job.deadlines[0];
        const startDate = new Date(deadline.date);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        const event = {
            title: `${deadline.title} - ${job.company}`,
            description: `Deadline for ${job.position} position at ${job.company}`,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            location: job.location || 'Not specified'
        };

        // Create calendar URL
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startTime.replace(/[-:]/g, '')}/${event.endTime.replace(/[-:]/g, '')}`;

        // Open in new tab
        window.open(calendarUrl, '_blank');
    };

    useEffect(() => {
        console.log('\n=== Component Mount Debug ===');
        console.log('Is authenticated:', isAuthenticated());
        console.log('API_URL configured:', !!API_URL);
        console.log('User data:', getUser());

        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        if (!API_URL) {
            console.error('API_URL is not defined in environment variables');
            setError('API configuration error');
            return;
        }

        const loadInitialData = async () => {
            console.log('Starting initial data load...');
            setLoading(true);
            await fetchUserData();
            setLoading(false);
            console.log('Initial data load complete');
        };

        loadInitialData();
    }, [navigate, API_URL]);

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
                        <div className="section-actions">
                            <button
                                onClick={exportToGoogleSheets}
                                className="export-sheets-button"
                                title="Export to Google Sheets"
                            >
                                <svg className="sheets-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                                    <path fill="currentColor" d="M7 7h10v2H7zM7 11h10v2H7zM7 15h10v2H7z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/new-application')}
                                className="add-button"
                            >
                                <svg className="plus-icon" viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                Add Job
                            </button>
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
                    </div>

                    {jobApplications.length > 0 && (
                        <div className="filter-bar">
                            <div className="sort-controls">
                                <label>Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="sort-select"
                                >
                                    <option value="appliedDate">Application Date</option>
                                    <option value="company">Company</option>
                                    <option value="status">Status</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="sort-direction-button"
                                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                            <div className="filter-controls">
                                <label>Filter by status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Status</option>
                                    <option value="wishlist">Wishlist</option>
                                    <option value="applied">Applied</option>
                                    <option value="interview">Interview</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="accepted">Accepted</option>
                                </select>
                            </div>
                        </div>
                    )}

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
                                {getSortedAndFilteredJobs().map(job => (
                                <div className="job-application-card" key={job._id}>
                                        <div className="job-info">
                                            <div className="job-header">
                                                <h3>{job.company}</h3>
                                                <span className={`status-badge ${job.status.toLowerCase()}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="position">{job.position}</p>
                                            <div className="job-details">
                                                <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                                                <p><strong>Work Type:</strong> {job.remoteStatus}</p>
                                                {job.salary && <p><strong>Salary:</strong> ${job.salary.toLocaleString()}</p>}
                                                {job.appliedDate && (
                                                    <p><strong>Applied:</strong> {new Date(job.appliedDate).toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="job-meta">
                                            {job.deadlines && job.deadlines.length > 0 && (
                                                <div className="deadlines">
                                                    <h4>Next Deadline</h4>
                                                    <p>{job.deadlines[0].title}: {new Date(job.deadlines[0].date).toLocaleDateString()}</p>
                                                    <button
                                                        onClick={() => exportToCalendar(job)}
                                                        className="export-calendar-button"
                                                        title="Export to Google Calendar"
                                                    >
                                                        <svg className="calendar-icon" viewBox="0 0 24 24" width="20" height="20">
                                                            <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    <div className="job-actions">
                                        {job.url && (
                                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="job-link">
                                                    View Post
                                            </a>
                                        )}
                                        <Link to={`/edit-application/${job._id}`} className="edit-button">
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Mock Interviews</h2>
                        <div className="section-actions">
                            <button
                                className="add-button"
                                onClick={() => navigate('/mock-interview')}
                            >
                                <svg className="plus-icon" viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                Start New Interview
                            </button>
                        </div>
                    </div>

                    {interviews.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <div className="empty-state-icon">🎯</div>
                                <h3>No Mock Interviews Yet</h3>
                                <p>Practice your interview skills with our AI-powered mock interviews.</p>
                                <button
                                    className="add-button"
                                    onClick={() => navigate('/mock-interview')}
                                >
                                    Start Your First Interview
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="interviews-grid">
                            {interviews.map(interview => (
                                <div key={interview._id} className="interview-card">
                                    <div className="interview-card-header">
                                        <div className="interview-date">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(interview.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        {interview.overallAnalysis?.score && (
                                            <div className="interview-score">
                                                <div className="score-badge">
                                                    {interview.overallAnalysis.score}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="interview-card-content">
                                        <div className="interview-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Questions</span>
                                                <span className="stat-value">{interview.questions?.length || 0}</span>
                                            </div>
                                            {interview.jobApplicationId && (
                                                <div className="stat-item">
                                                    <span className="stat-label">Linked Job</span>
                                                    <span className="stat-value">✓</span>
                                                </div>
                                            )}
                                        </div>

                                        {interview.overallAnalysis?.keyInsights && (
                                            <div className="interview-insights">
                                                <h4 className="insights-title">Key Insights</h4>
                                                <ul className="insights-list">
                                                    {interview.overallAnalysis.keyInsights.slice(0, 2).map((insight, index) => (
                                                        <li key={index}>{insight}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="interview-card-footer">
                                        <button
                                            className="view-button"
                                            onClick={() => navigate(`/interview/${interview._id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
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