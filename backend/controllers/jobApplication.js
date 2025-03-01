const express = require('express');
const router = express.Router();
const { JobApplication } = require('../models');

// Test endpoint - Get all job applications
router.get('/test', async (req, res) => {
    try {
        const jobs = await JobApplication.find({})
            .limit(5)
            .populate('userId', 'email name'); // This will include user details
        res.json({
            message: 'Job Application controller is connected',
            jobCount: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint - Create a test job application
router.post('/test', async (req, res) => {
    try {
        // First get any user from the database
        const testJob = new JobApplication({
            userId: '65f123456789abcdef123456', // You'll need to replace this with a real user ID
            company: 'Test Company',
            position: 'Test Position',
            status: 'Wishlist',
            remoteStatus: 'Remote'
        });
        const savedJob = await testJob.save();
        res.json({
            message: 'Test job application created successfully',
            job: savedJob
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 