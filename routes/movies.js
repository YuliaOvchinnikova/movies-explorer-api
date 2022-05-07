const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');

const {
  getSavedMovies,
  createMovie,
  deleteSavedMovieById,
} = require('../controllers/movies');

router.get('/', getSavedMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom((url, helper) => {
      if (!isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        return helper.message(`${url} не валидная ссылка.`);
      }
      return url;
    }),
    trailerLink: Joi.string().required().custom((url, helper) => {
      if (!isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        return helper.message(`${url} не валидная ссылка.`);
      }
      return url;
    }),
    thumbnail: Joi.string().required().custom((url, helper) => {
      if (!isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        return helper.message(`${url} не валидная ссылка.`);
      }
      return url;
    }),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    movieId: Joi.number().required(),
  }),
}), createMovie);

router.delete('/:movie_id', celebrate({
  params: Joi.object().keys({
    movie_id: Joi.string().hex().length(24),
  }),
}), deleteSavedMovieById);

module.exports = router;
