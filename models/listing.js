const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: Number,
    location: String,
    images: {
        type: [String],
        default: ["https://unsplash.com/illustrations/a-blue-square-with-a-white-check-mark-on-it-PB3ZserDqcs"],
        set: (images) => images === "" ? "https://unsplash.com/illustrations/a-blue-square-with-a-white-check-mark-on-it-PB3ZserDqcs" 
        : images,
    },  
    country: String,
    // availableDates: [Date],
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;

