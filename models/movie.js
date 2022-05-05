const mongoose = require('mongoose');
const { isURL } = require('validator');

const { ObjectId } = mongoose.Schema.Types;

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator(url) {
        return isURL(url, { protocols: ['http', 'https'], require_protocol: true });
      },
      message: (props) => `${props.value} не валидная ссылка.`,
    },
  },
  trailerLink: {
    type: String,
    required: true,
    validate: {
      validator(url) {
        return isURL(url, { protocols: ['http', 'https'], require_protocol: true });
      },
      message: (props) => `${props.value} не валидная ссылка.`,
    },
  },

  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator(url) {
        return isURL(url, { protocols: ['http', 'https'], require_protocol: true });
      },
      message: (props) => `${props.value} не валидная ссылка.`,
    },
  },
  owner: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },

  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
