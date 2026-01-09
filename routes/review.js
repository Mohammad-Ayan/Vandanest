const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// Review - Post route
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
   console.log("🧾 Received review data:", req.body);
   const listing = await Listing.findById(req.params.id);
   const newReview = new Review(req.body.review);
   newReview.author = req.user._id; // Associate review with logged-in user
   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();

   req.flash("success", "Successfully added a new review!");
   res.redirect(`/listings/${listing._id}`);
}));

// Delete Review - Delete route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
   const { id, reviewId } = req.params;
   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
   await Review.findByIdAndDelete(reviewId);
   req.flash("success", "Review Deleted!");
   res.redirect(`/listings/${id}`);
}));

module.exports = router;