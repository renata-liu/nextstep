const mongoose = require('mongoose');
const { Schema } = mongoose;

const mockInterviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobApplicationId: {
        type: Schema.Types.ObjectId,
        ref: 'JobApplication'
    },
    date: {
        type: Date,
        default: Date.now
    },
    questions: [{
        question: String,
        videoUrl: String,
        transcription: String,
        analysis: {
            score: Number,
            strengths: [String],
            weaknesses: [String],
            suggestions: [String]
        }
    }],
    overallAnalysis: {
        score: Number,
        summary: String,
        keyInsights: [String],
        improvementAreas: [String]
    },
    gumloopResponseId: String
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema); 