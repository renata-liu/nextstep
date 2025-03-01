const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Test endpoint - Get all users
router.get('/test', async (req, res) => {
    try {
        const users = await User.find({}).limit(5);
        res.json({
            message: 'User controller is connected',
            userCount: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint - Create a test user
router.post('/test', async (req, res) => {
    try {
        const testUser = new User({
            email: `test${Date.now()}@example.com`,
            password: 'testpassword',
            name: 'Test User'
        });
        const savedUser = await testUser.save();
        res.json({
            message: 'Test user created successfully',
            user: savedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 