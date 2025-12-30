const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema } = require('../schema.js');

// Validate Listing Middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index route -> to show all listings
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
}));

// New route -> to create a new listing {form}
router.get('/new', (req, res) => {
    res.render('listings/new.ejs');
});


// Show route -> to show details of a specific listing
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render('listings/show.ejs', { listing });
}));

// Create route -> to add the new listing to the database
router.post('/', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}));


// Edit route -> to edit a specific listing {form}
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render('listings/edit.ejs', { listing });
}));

// Update route -> to update the edited listing in the database
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete route -> to delete a specific listing from the database
router.delete('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log('Deleted Listing:', deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');
}));

module.exports = router;