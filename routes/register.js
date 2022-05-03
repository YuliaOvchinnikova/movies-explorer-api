const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { login, createUser } = require("../controllers/users");

router.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(4),
    }),
  }),
  login,
);

router.post(
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

module.exports = router;
