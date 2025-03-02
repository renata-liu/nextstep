import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>NextStep</h3>
                    <p>Your AI-powered job application and interview preparation companion.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <nav>
                        <Link to="/">Home</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/mock-interview">Mock Interview</Link>
                    </nav>
                </div>
                <div className="footer-section">
                    <h4>Resources</h4>
                    <nav>
                        <Link to="/interview-analysis">Interview Analysis</Link>
                        <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                            Chrome Extension
                        </a>
                    </nav>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} NextStep. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer; 