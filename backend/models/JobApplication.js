const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobApplicationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'],
        default: 'Wishlist'
    },
    salary: String,
    location: String,
    remoteStatus: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site', 'Unknown'],
        default: 'Unknown'
    },
    appliedDate: Date,
    notes: String,
    links: [{
        title: String,
    url: String
    }],
    deadlines: [{
        title: String,
        date: Date,
        googleCalendarEventId: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);