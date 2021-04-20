const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const campgroundSchema = new Schema({
  title: String,
  img: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId, ref: 'Review'
    }
]
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;
