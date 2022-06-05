const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).send({
    message: status === 500 ? 'Произошла внутренняя ошибка' : err.message,
  });
  next();
};

module.exports = errorHandler;
