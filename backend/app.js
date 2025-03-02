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

// Basic middleware
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection with better error handling
mongoose.set('strictQuery', false);
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting MongoDB connection...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
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

// Comprehensive request logging
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        headers: {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Bearer [hidden]' : 'none',
        }
    });
    next();
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Health check route (outside API routes)
app.get('/health', (req, res) => {
    try {
        res.json({
            status: 'ok',
            message: 'Server is running',
            env: process.env.NODE_ENV,
            mongoConnected: mongoose.connection.readyState === 1
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Create router for API routes
const apiRouter = express.Router();

// Mount routes on the API router
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/jobs', jobRouter);
apiRouter.use('/interviews', interviewRouter);

// Mount the API router at /api
app.use('/api', apiRouter);

// 404 handler with detailed logging
app.use((req, res) => {
    console.error('\n=== 404 Error ===');
    console.error({
        method: req.method,
        url: req.originalUrl,
        headers: req.headers
    });
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
    console.error('\n=== Server Error ===');
    console.error({
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = app;