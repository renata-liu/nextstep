const express = require('express');
const router = express.Router();
const { JobApplication } = require('../models');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

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

// Get all job applications for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        console.log('\n=== GET /jobs Debug ===');
        console.log('User ID from request:', req.user._id);
        console.log('User ID type:', typeof req.user._id);

        // First check all jobs to see if any exist
        const allJobs = await JobApplication.find({});
        console.log('All jobs in database:', allJobs.map(job => ({
            id: job._id,
            userId: job.userId,
            company: job.company
        })));

        // Now try to find jobs for this specific user
        const jobs = await JobApplication.find({ userId: req.user._id });
        console.log('Query result:', {
            searchedUserId: req.user._id,
            count: jobs.length,
            isEmpty: jobs.length === 0,
            jobs: jobs.map(job => ({
                id: job._id,
                userId: job.userId,
                company: job.company
            }))
        });

        // Check if collection exists and has documents
        const collections = await mongoose.connection.db.listCollections().toArray();
        const jobCollection = collections.find(c => c.name === 'jobapplications');
        console.log('Collection info:', {
            exists: !!jobCollection,
            name: jobCollection?.name,
            type: jobCollection?.type
        });

        // Try an alternative query using string comparison
        const jobsAlt = await JobApplication.find({
            userId: req.user._id.toString()
        });
        console.log('Alternative query result:', {
            count: jobsAlt.length,
            isEmpty: jobsAlt.length === 0
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error in GET /jobs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a specific job application
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await JobApplication.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!job) {
            return res.status(404).json({ message: 'Job application not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new job application
router.post('/', auth, async (req, res) => {
    try {
        const jobApplication = new JobApplication({
            ...req.body,
            userId: req.user._id
        });
        const savedJob = await jobApplication.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a job application
router.put('/:id', auth, async (req, res) => {
    try {
        const job = await JobApplication.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!job) {
            return res.status(404).json({ message: 'Job application not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a job application
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await JobApplication.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!job) {
            return res.status(404).json({ message: 'Job application not found' });
        }
        res.json({ message: 'Job application deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 