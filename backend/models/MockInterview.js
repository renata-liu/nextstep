const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    feedback: String,
    score: Number
});

const mockInterviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication'
    },
    date: {
        type: Date,
        default: Date.now
    },
    questions: [questionSchema],
    overallAnalysis: {
        score: Number,
        keyInsights: [String],
        strengths: [String],
        improvements: [String]
    },
    gumloopResponseId: String
}, {
    timestamps: true
});

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview; 