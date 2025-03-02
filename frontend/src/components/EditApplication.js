import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../services/auth';
import './NewApplication.css'; // Reusing the same styles

const EditApplication = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        status: 'Wishlist',
        remoteStatus: 'On-site',
        location: '',
        salary: '',
        appliedDate: '',
        notes: '',
        url: '',
        deadlines: [{ title: '', date: '' }]
    });

    // Fetch existing application data
    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const API_URL = process.env.REACT_APP_API_URL;
                if (!API_URL) {
                    throw new Error('API URL not configured');
                }

                const response = await fetch(`${API_URL}/jobs/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch job application');
                }

                // Format the data for the form
                setFormData({
                    ...data,
                    salary: data.salary?.toString() || '',
                    appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString().split('T')[0] : '',
                    deadlines: data.deadlines?.map(d => ({
                        ...d,
                        date: new Date(d.date).toISOString().split('T')[0]
                    })) || [{ title: '', date: '' }]
                });
            } catch (err) {
                console.error('Error fetching job application:', err);
                setError(err.message || 'Failed to load application data');
            }
        };

        fetchApplication();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeadlineChange = (index, field, value) => {
        const newDeadlines = [...formData.deadlines];
        newDeadlines[index] = {
            ...newDeadlines[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            deadlines: newDeadlines
        }));
    };

    const addDeadline = () => {
        setFormData(prev => ({
            ...prev,
            deadlines: [...prev.deadlines, { title: '', date: '' }]
        }));
    };

    const removeDeadline = (index) => {
        setFormData(prev => ({
            ...prev,
            deadlines: prev.deadlines.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const API_URL = process.env.REACT_APP_API_URL;
            if (!API_URL) {
                throw new Error('API URL not configured');
            }

            // Prepare the request data
            const requestData = {
                ...formData,
                salary: formData.salary ? Number(formData.salary) : undefined,
                deadlines: formData.deadlines.filter(d => d.title && d.date)
            };

            // Make the API request using PUT for updates
            const response = await fetch(`${API_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update job application');
            }

            console.log('Job application updated successfully:', data);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error updating job application:', err);
            setError(err.message || 'An error occurred while updating the application');
        } finally {
            setLoading(false);
        }
    };

    // Reuse the same form structure from NewApplication
    return (
        <div className="new-application-container">
            <div className="new-application-card">
                <h2>Edit Job Application</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="new-application-form">
                    {/* Same form fields as NewApplication */}
                    <div className="form-group">
                        <label htmlFor="company">Company*</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter company name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Position*</label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter position title"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="Wishlist">Wishlist</option>
                                <option value="Applied">Applied</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Accepted">Accepted</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="remoteStatus">Work Type</label>
                            <select
                                id="remoteStatus"
                                name="remoteStatus"
                                value={formData.remoteStatus}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="On-site">On-site</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter job location"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="salary">Salary</label>
                        <input
                            type="number"
                            id="salary"
                            name="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            placeholder="Enter annual salary"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="appliedDate">Date Applied</label>
                        <input
                            type="date"
                            id="appliedDate"
                            name="appliedDate"
                            value={formData.appliedDate}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="url">Job URL</label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="Enter job posting URL"
                            disabled={loading}
                        />
                    </div>

                    <div className="deadlines-section">
                        <label>Deadlines</label>
                        {formData.deadlines.map((deadline, index) => (
                            <div key={index} className="deadline-row">
                                <div className="deadline-inputs">
                                    <input
                                        type="text"
                                        placeholder="Deadline title"
                                        value={deadline.title}
                                        onChange={(e) => handleDeadlineChange(index, 'title', e.target.value)}
                                        disabled={loading}
                                    />
                                    <input
                                        type="date"
                                        value={deadline.date}
                                        onChange={(e) => handleDeadlineChange(index, 'date', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                {formData.deadlines.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-deadline-btn"
                                        onClick={() => removeDeadline(index)}
                                        disabled={loading}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="add-deadline-btn"
                            onClick={addDeadline}
                            disabled={loading}
                        >
                            + Add Deadline
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Enter any additional notes"
                            disabled={loading}
                            rows="4"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Update Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditApplication; 