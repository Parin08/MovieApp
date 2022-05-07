const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    required: true
  },
  director: {
    type: String,
    required: true
  },
  writer: {
    type: String,
    required: true
  },
  cast: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imdbRating: {
    type: String,
    required: true,
    min: 0
  },
  showtime: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Showtime' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Movies = mongoose.model('Movies', movieSchema);

module.exports = Movies;