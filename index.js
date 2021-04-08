const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connection Open');
})
.catch((err) => {
  console.log('Something went wrong trying to connect to mongoDB');
  console.log(err);
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
// --------------------routers---------------------------
app.get('/', (req, res) => {
  res.render('home');
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
});

app.get('/campgrounds/new',(req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async(req, res) => {
  console.log(req.body);
  const campground = new Campground(req.body);
  await campground.save().then((data) => {
    console.log('Data saved');
    console.log(data);
  })
  res.redirect('/campgrounds');
});

app.get('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/show', {campground});
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', {campground});
});

app.put('/campgrounds/:id', async(req, res) => {
  const {id} = req.params;
  const {title, location} = req.body;
  const campground = await Campground.findByIdAndUpdate(id, {title, location, new: true,});
  res.redirect(`/campgrounds/${id}`);
})

app.delete('/campgrounds/:id', async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect(`/campgrounds`);
})


app.listen(3000, () => {
  console.log('Listening in port 3000');
})
