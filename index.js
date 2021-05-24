//process.env.NODE_ENV is an enviroment variable that is usually is just development or production
// we are saying, if we are running in development mode, require the dotenv package.
// this will take the variable we defined in the .env file and add it to process,env
// WE DONT USE THIS IN DEVELOPMENT MODE
if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// console.log(process.env.secret);

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./helpers/AppError');
// const Joi = require('joi'); we dont need it anymore cuz importing campgroundSchema

const campgroundRoutes = require('./routes/campgrounds');
const usersRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviews');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');

const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connection Open');
})
.catch((err) => {
  console.log('Something went wrong trying to connect to mongoDB');
  console.log(err);
})

// ----------------middleawares and configurations-------------------
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
app.use(passport.initialize());
app.use(passport.session());

// flash msg handler
// well have access it to automatically in our temple
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})
// ----------------------passport stuff----------------------------------------

passport.use(new localStrategy(User.authenticate()));
// how to stored and un-stored users in a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/fakeUser', async (req, res) => {
  const user = new User({email: 'Jean@gmail.com', username: 'JeanPorn'});
  const newUser = await User.register(user, 'porn');
  res.send(newUser);
})

// --------------------routers---------------------------

app.get('/', (req, res) => {
  res.render('home');
})

app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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
