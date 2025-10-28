const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema } = require('./schema.js');
const Joi = require("joi");

const MONGODB_URL = "mongodb://127.0.0.1:27017/vandanest";

main().then(() => {
    console.log('Database connection established');
})
    .catch(err => {
        console.error('Database connection error:', err);
    });

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {  // defines what to do when a request comes
    res.send('Hi, I am root');
});

// Validate Listing Middleware
const validateListing = (req, res, next) => {
    // if (!req.body || !req.body.listing) {
    //     throw new ExpressError(400, 'ValidationError: "listing" is required');
    // }
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index route -> to show all listings
app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
}));

// New route -> to create a new listing {form}
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// Create route -> to add the new listing to the database
app.post('/listings', validateListing, wrapAsync(async (req, res, next) => {
    // let {title, description, price, location, images, country} = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings`);
})
);

// Show route -> to show details of a specific listing
app.get('/listings/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', { listing });
}));


// Edit route -> to edit a specific listing {form}
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

// Update route -> to update the edited listing in the database
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete route -> to delete a specific listing from the database
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log('Deleted Listing:', deletedListing);
    res.redirect('/listings');
}));


app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// error handling middleware
// Error handler middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});


app.listen(8080, () => { // turns the server on and starts waiting for requests
    console.log('Server is running on port 8080');
});