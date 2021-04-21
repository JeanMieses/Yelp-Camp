const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./helpers/AppError');
// const Joi = require('joi'); we dont need it anymore cuz importing campgroundSchema
const campgrounds= require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');

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
app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));
app.use(flash());

// flash msg handler
// well have access it to automatically in our temple
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})
// --------------------routers---------------------------
app.get('/', (req, res) => {
  res.render('home');
})


app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);


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
