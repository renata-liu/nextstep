const express = require('express');
const router = express.Router();
const { MockInterview } = require('../models');
const { auth } = require('../middleware/auth');

// Get all interviews for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const interviews = await MockInterview.find({ userId: req.user._id })
            .populate('jobApplicationId', 'company position');
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific interview
router.get('/:id', auth, async (req, res) => {
    try {
        const interview = await MockInterview.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('jobApplicationId', 'company position');
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new interview
router.post('/', auth, async (req, res) => {
    try {
        const interview = new MockInterview({
            ...req.body,
            userId: req.user._id,
            date: new Date()
        });
        const savedInterview = await interview.save();
        res.status(201).json(savedInterview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an interview
router.put('/:id', auth, async (req, res) => {
    try {
        const interview = await MockInterview.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.json(interview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an interview
router.delete('/:id', auth, async (req, res) => {
    try {
        const interview = await MockInterview.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.json({ message: 'Interview deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 