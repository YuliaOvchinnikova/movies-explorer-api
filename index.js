const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { PORT = 3001, NODE_ENV, MONGODB_URL } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { errors } = require('celebrate');
require('dotenv').config();
const ErrorNotFound = require('./errors/ErrorNotFound');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const allowedCors = [
  'http://movies-library.nomoredomains.work',
  'https://movies-library.nomoredomains.work',
];

app.use(requestLogger);

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  const { method } = req;

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  }

  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  next();
  return {};
});

app.use(require('./routes'));

app.use(() => {
  throw new ErrorNotFound('Страница не найдена!');
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(
  NODE_ENV === 'production'
    ? MONGODB_URL
    : 'mongodb://localhost:27017/bitfilmsdb',
  {
    useNewUrlParser: true,
  },
);

app.listen(PORT);
