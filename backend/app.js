require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Import routes (you'll create these later)
const userRouter = require('./controllers/user');
const jobRouter = require('./controllers/jobApplication');
const interviewRouter = require('./controllers/mockInterview');

const app = express();

// MongoDB connection
mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/users', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/interviews', interviewRouter);

// Test route
app.get('/api/health', (req, res) => {
    res.send('Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;