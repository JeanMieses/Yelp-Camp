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
const reviews = require('../controllers/reviews');

// review
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

// DELETE review/comment
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
