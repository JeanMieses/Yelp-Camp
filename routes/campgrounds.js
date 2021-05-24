const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {isLoggedIn} = require('../middleware.js');
const {validateCampground} = require('../middleware.js');
const {isAuthor} = require('../middleware.js');
//controllers
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
  // we dont no need to specific the path anymore
  .get(
    catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('imgs'), validateCampground, catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isAuthor, upload.array('imgs'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isAuthor, catchAsync(campgrounds.deleteCampground))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
