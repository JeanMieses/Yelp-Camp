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
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    // console.log(i + " - " + cities[randomNum].city);
    const camp = new Campground({
      author: '6091abd7d9778c24bc711e8c',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[randomNum].city}, ${cities[randomNum].state}`,
      img: `https://images.unsplash.com/photo-1573146500785-c84e60e35184?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80`,
      description: 'Fun Yelpcamp to relax and meet new people',
      price: randomPrice
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
