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
    image: {
        type: [
            {
                filename: String,
                url: String,
            }
        ],
        default: [
            {
                filename: "listingimage",
                url: "https://unsplash.com/illustrations/a-blue-square-with-a-white-check-mark-on-it-PB3ZserDqcs"
            }
        ],
    }, 
    country: String,
    // availableDates: [Date],
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;

