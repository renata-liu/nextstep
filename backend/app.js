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
        'http://localhost:3001',    // Local frontend
        'http://localhost:5173',    // Vite default port if you're using it
        'https://nextstep-eta.vercel.app/', // Add your deployed frontend URL
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
app.use(morgan('tiny'));

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

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

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/interviews', interviewRouter);

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;