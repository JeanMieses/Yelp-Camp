const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const AppError = require('../helpers/AppError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const isLoggedIn = require('../middleware.js');

const validateCampground = (req, res, next) => {
  // this will validtae data before we try to save it on mongodb
  // the campgroundSchemam is on the file schema.js
  const {error} = campgroundSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new AppError(msg, 400)
  } else {
    next();
  }
}

router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
}));

// create new camp
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.post('/', validateCampground, isLoggedIn, catchAsync(async(req, res, next) => {
  // console.log(req.body);
  // console.log(req.body.campground);
    // if(!req.body.campground)  throw new AppError('Invalid Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save()
    req.flash('success', 'successfully made a new campgrounds');
    res.redirect(`/campgrounds/${campground._id}`);
  }));

// show specific camp
router.get('/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  if(!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', {campground});
}));

// update camp
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', {campground});
}));

router.put('/:id', validateCampground, catchAsync(async(req, res) => {
  const {id} = req.params;
  const {title, location, description, img, price} = req.body.campground;
  const campground = await Campground.findByIdAndUpdate(id, {title, location, price, description, img}, {new: true, useFindAndModify: false});
  req.flash('success', 'successfully saved new changes');
  res.redirect(`/campgrounds/${id}`);
}));

// delete camp
router.delete('/:id', catchAsync(async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'successfully delete campground');
  res.redirect(`/campgrounds`);
}));

module.exports = router;
