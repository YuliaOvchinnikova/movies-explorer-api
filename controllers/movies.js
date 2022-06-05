const Movie = require('../models/movie');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorValidation = require('../errors/ErrorValidation');
const ErrorForbidden = require('../errors/ErrorForbidden');

module.exports.getSavedMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send({ data: movies }))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country, director, duration, year,
    description, image, trailerLink, thumbnail, nameRU, nameEN,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
    movieId,
    owner,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorValidation('Данные для создания карточки не корректны.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteSavedMovieById = (req, res, next) => {
  Movie.findById(req.params.movie_id).orFail(() => {
    throw new ErrorNotFound(`Фильм с id ${req.params.cardId} для пользовтеля ${req.user._id} не найден.`);
  })
    .then((movie) => {
      if (req.user._id !== movie.owner.toString()) {
        throw new ErrorForbidden('Вы не можете удалить не ваш сохраненный фильм');
      }
      Movie.deleteOne({ _id: req.params.movie_id }).then(() => res.send({ data: movie }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorValidation(`Некорректный id ${req.params.cardId}`));
      } else if (err.name === 'ValidationError') {
        next(new ErrorValidation('Неправильные данные'));
      } else {
        next(err);
      }
    });
};
