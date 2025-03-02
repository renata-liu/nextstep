const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { validateSignup } = require('../middleware/validate');

// Register a new user
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Signup attempt for:', email);

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({ email, password });

        // Log the user object before saving (excluding password)
        console.log('Creating new user:', {
            email: user.email,
            id: user._id
        });

        await user.save();
        console.log('User saved successfully');

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error details:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for:', email);

        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        console.log('User found:', !!user);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log user details (excluding sensitive info)
        console.log('Found user:', {
            id: user._id,
            email: user.email,
            hasPassword: !!user.password
        });

        // Compare passwords
        try {
            console.log('Attempting password comparison');
            const isMatch = await user.comparePassword(password);
            console.log('Password comparison result:', isMatch);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Success response
            res.json({
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error('Password comparison error details:', {
                error: error.message,
                stack: error.stack,
                user: user._id
            });
            return res.status(500).json({
                message: 'Error during password comparison',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    } catch (error) {
        console.error('Login error details:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error during login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Logout (optional - frontend can handle token removal)
router.post('/logout', auth, (req, res) => {
    try {
        // You might want to add token to a blacklist here
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 