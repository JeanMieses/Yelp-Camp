const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./helpers/AppError');
const catchAsync = require('./helpers/catchAsync');
// const Joi = require('joi'); we dont need it anymore cuz importing campgroundSchema
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('./models/review')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connection Open');
})
.catch((err) => {
  console.log('Something went wrong trying to connect to mongoDB');
  console.log(err);
})

// ----------------middleawares-------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
// --------------------routers---------------------------
app.get('/', (req, res) => {
  res.render('home');
})

// show all camps
app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
}));

// create new camp
app.get('/campgrounds/new',(req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
  // console.log(req.body);
  // console.log(req.body.campground);
    // if(!req.body.campground)  throw new AppError('Invalid Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);
  }));

// show specific camp
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render('campgrounds/show', {campground});
}));

// update camp
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) => {
  const {id} = req.params;
  const {title, location, description, img, price} = req.body.campground;
  const campground = await Campground.findByIdAndUpdate(id, {title, location, price, description, img}, {new: true, useFindAndModify: false});
  res.redirect(`/campgrounds/${id}`);
}));

// delete camp
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect(`/campgrounds`);
}));

// review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
  const {id} = req.params
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${id}`);
}))

// DELETE review/comment
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async(req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))

// if we tried to request some url that we dont recognize
app.all('*', (req, res, next) => {
  // res.send('404');
  next(new AppError('Page Not Found', 404));
});

// handling errors
app.use((err, req, res, next) => {
  const {statusCode = 500} = err
  // we must pass tehe error cus the message wont work

  if(!err.message) err.message = "Ohh no, something went wrong"
  res.status(statusCode).render('error', {err});
  // res.send('ohh boys, something went wrong');
});

app.listen(3000, () => {
  console.log('Listening in port 3000');
});
