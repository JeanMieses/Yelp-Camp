const express = require('express');
// we need mergerParams: true to get access to params
const router = express.Router({mergeParams: true});
const catchAsync = require('../helpers/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../helpers/AppError');
const {validateReview} = require('../middleware.js');
const {isLoggedIn} = require('../middleware.js');
const {isReviewAuthor} = require('../middleware.js');

// review
router.post('/', validateReview, isLoggedIn, catchAsync(async(req, res) => {
  const {id} = req.params
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  req.flash('success', 'Review Posted');
  res.redirect(`/campgrounds/${id}`);
}))

// DELETE review/comment
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}, {useFindAndModify: false})
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
