const express = require('express');
// we need mergerParams: true to get access to params
const router = express.Router({mergeParams: true});
const catchAsync = require('../helpers/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../helpers/AppError');
const {campgroundSchema, reviewSchema} = require('../schemas.js');

// middleawares
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

// review
router.post('/', validateReview, catchAsync(async(req, res) => {
  const {id} = req.params
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  req.flash('success', 'Review Posted');
  res.redirect(`/campgrounds/${id}`);
}))

// DELETE review/comment
router.delete('/:reviewId', catchAsync( async(req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}, {useFindAndModify: false})
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
