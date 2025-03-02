const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation Error',
            errors: errors.array()
        });
    }
    next();
};

// Validation rules for user registration
const validateSignup = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    validate
];

// Validation rules for job application
const validateJobApplication = [
    body('company')
        .trim()
        .notEmpty()
        .withMessage('Company name is required'),
    body('position')
        .trim()
        .notEmpty()
        .withMessage('Position is required'),
    body('status')
        .isIn(['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'])
        .withMessage('Invalid status'),
    body('remoteStatus')
        .optional()
        .isIn(['Remote', 'Hybrid', 'On-site'])
        .withMessage('Invalid remote status'),
    body('salary')
        .optional()
        .isNumeric()
        .withMessage('Salary must be a number'),
    validate
];

// Validation rules for mock interview
const validateMockInterview = [
    body('jobApplicationId')
        .optional()
        .isMongoId()
        .withMessage('Invalid job application ID'),
    body('questions')
        .isArray()
        .withMessage('Questions must be an array'),
    body('questions.*.question')
        .notEmpty()
        .withMessage('Question text is required'),
    body('questions.*.answer')
        .notEmpty()
        .withMessage('Answer text is required'),
    validate
];

module.exports = {
    validate,
    validateSignup,
    validateJobApplication,
    validateMockInterview
}; 