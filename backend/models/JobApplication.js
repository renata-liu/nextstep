const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const jobApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required']
    },
    position: {
        type: String,
        required: [true, 'Position is required']
    },
    status: {
        type: String,
        enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'],
        default: 'Wishlist'
    },
    remoteStatus: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site'],
        default: 'On-site'
    },
    location: String,
    salary: Number,
    appliedDate: Date,
    deadlines: [deadlineSchema],
    notes: String,
    url: String
}, {
    timestamps: true
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication; 