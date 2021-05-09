const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', 'successfully made a new campgrounds');
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.showCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate({
    //populate the reviews, then their author
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author'); //author for campground

  if(!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }

  res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res) => {
  const {id} = req.params;
  const {title, location, description, img, price} = req.body.campground;
  const campground = await Campground.findByIdAndUpdate(id, {title, location, price, description, img}, {new: true, useFindAndModify: false});
  req.flash('success', 'successfully saved new changes');
  res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'successfully delete campground');
  res.redirect(`/campgrounds`);
}
