const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connection Open');
})
.catch((err) => {
  console.log('Something went wrong trying to connect to mongoDB');
  console.log(err);
})

function sample(array) {
  let index = Math.floor(Math.random() * array.length)
  return array[index];
}

const seedDB = async () => {
  await Campground.deleteMany({});

  for(let i = 0; i < 50; i++) {
    const randomNum = Math.floor(Math.random() * 1000);
    // console.log(i + " - " + cities[randomNum].city);
    const camp = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[randomNum].city}, ${cities[randomNum].state}`
    })

    await camp.save()
    .then((data) => {
      console.log(data);
    });

  }
}

seedDB()
.then(() => {
  mongoose.connection.close();
});
