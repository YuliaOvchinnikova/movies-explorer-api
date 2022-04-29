const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");

const { PORT = 3001 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { errors } = require("celebrate");
const { celebrate, Joi } = require("celebrate");
const ErrorNotFound = require("./errors/ErrorNotFound");
const errorHandler = require("./middlewares/errorHandler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");

const allowedCors = [
  "http://movies-library.nomoredomains.work/signup",
  "https://movies-library.nomoredomains.work/signup",
];

app.use(requestLogger);

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  const { method } = req;

  const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";

  if (method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
  }

  const requestHeaders = req.headers["access-control-request-headers"];
  if (method === "OPTIONS") {
    res.header("Access-Control-Allow-Headers", requestHeaders);
    return res.end();
  }
  next();
  return {};
});

app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(4),
    }),
  }),
  login,
);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(4),
    }),
  }),
  createUser,
);

app.use(cookieParser());
app.use(auth);

app.get("/signout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

app.use("/users", require("./routes/users"));
app.use("/movies", require("./routes/movies")); 

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.use(() => {
  throw new ErrorNotFound("Страница не найдена!");
});


mongoose.connect("mongodb://localhost:27017/bitfilmsdb", {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
}) 

