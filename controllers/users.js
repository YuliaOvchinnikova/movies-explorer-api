const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');
const ErrorValidation = require('../errors/ErrorValidation');
const ErrorUnauthorized = require('../errors/ErrorUnauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.user._id} не найден.`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        throw new ErrorConflict('Пользователь с таким email уже зарегистрирован.');
      }
      User.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true, runValidators: true },
      )
        .orFail(() => {
          throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден.`);
        })
        .then((user) => res.send({ data: user }))
        .catch((err) => {
          if (err.name === 'ValidationError' || err.email === 'ValidationError') {
            next(new ErrorValidation('Неправильные данные'));
          } else {
            next(err);
          }
        });
    }).catch((err) => {
      if (err.name === 'ValidationError' || err.email === 'ValidationError') {
        next(new ErrorValidation('Неправильные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ErrorConflict('Пользователь с таким email уже зарегистрирован.');
      }
      return bcrypt.hash(password, SALT_ROUNDS);
    })
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        data: {
          name: user.name,
          email: user.email,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorValidation(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',

        { expiresIn: '7d' },
      );

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .end();
    })
    .catch((err) => {
      next(new ErrorUnauthorized(err.message));
    });
};
