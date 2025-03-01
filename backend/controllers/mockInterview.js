const express = require('express');
const router = express.Router();
const { MockInterview } = require('../models');

// Test endpoint - Get all interviews
router.get('/test', async (req, res) => {
    try {
        const interviews = await MockInterview.find({})
            .limit(5)
            .populate('userId', 'email name')
            .populate('jobApplicationId');
        res.json({
            message: 'Mock Interview controller is connected',
            interviewCount: interviews.length,
            interviews
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint - Create a test interview
router.post('/test', async (req, res) => {
    try {
        const testInterview = new MockInterview({
            userId: '65f123456789abcdef123456', // You'll need to replace this with a real user ID
            questions: [{
                question: 'Test question?',
                videoUrl: 'http://example.com/video',
                analysis: {
                    score: 8,
                    strengths: ['Good communication'],
                    weaknesses: ['Could improve eye contact'],
                    suggestions: ['Practice more']
                }
            }],
            overallAnalysis: {
                score: 8,
                summary: 'Good performance overall',
                keyInsights: ['Strong technical knowledge'],
                improvementAreas: ['Body language']
            }
        });
        const savedInterview = await testInterview.save();
        res.json({
            message: 'Test interview created successfully',
            interview: savedInterview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 