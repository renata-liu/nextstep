require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const userRouter = require('./controllers/user');
const jobRouter = require('./controllers/jobApplication');
const interviewRouter = require('./controllers/mockInterview');
const authRouter = require('./controllers/auth');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        'http://localhost:3001',
        'http://localhost:5173',
        'https://nextstep-eta.vercel.app' // Remove trailing slash
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow cookies if you're using them
    optionsSuccessStatus: 200
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// MongoDB connection with better error handling
mongoose.set('strictQuery', false);
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting MongoDB connection...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
        // Log the connection state
        console.log('MongoDB connection state:', mongoose.connection.readyState);
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Monitor for disconnections
mongoose.connection.on('disconnected', () => {
    console.log('Lost MongoDB connection...');
});

mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB...');
});

// Add unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in development
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Test route with error handling
app.get('/api/health', (req, res) => {
    try {
        res.json({ status: 'ok', message: 'Server is running' });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Routes - direct middleware usage
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/interviews', interviewRouter);

// Add logging middleware before the routes if you want to log access
app.use((req, res, next) => {
    console.log('Route accessed:', req.method, req.path);
    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;