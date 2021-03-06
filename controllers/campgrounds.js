const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.imgs = req.files.map(f => ({url: f.path, fileName: f.filename }));
    campground.author = req.user._id;
    await campground.save();
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
  console.log(req.body);
  const {title, location, description, img, price} = req.body.campground;
  const campground = await Campground.findByIdAndUpdate(id, {title, location, price, description, img}, {new: true, useFindAndModify: false});
  console.log(campground);
  const imgs = req.files.map(f => ({url: f.path, fileName: f.filename }));
  campground.imgs.push(... imgs);

  if(req.body.deleteImgs){
    for(let filename of req.body.deleteImgs){
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({$pull: {imgs: {fileName: {$in: req.body.deleteImgs}}}});

  }

  campground.save();
  req.flash('success', 'successfully saved new changes');
  res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'successfully delete campground');
  res.redirect(`/campgrounds`);
}
