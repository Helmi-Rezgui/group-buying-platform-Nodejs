const mongoose = require('mongoose');
const date = require('date-and-time');




const feedbackSchema  = mongoose.Schema({
   
    user: String, 
    feedbackText: String,
    rating: Number,
    timestamp: { type: Date, default: Date.now }
})       





exports.Feedback = mongoose.model('feedback',feedbackSchema);

