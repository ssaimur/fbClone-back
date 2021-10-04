const { BadRequestError } = require('../errors/BadRequestError');
const CustomApiError = require('../errors/customError');

const errorHandler = (err, req, res, next) => {
  const customError = {
    success: false,
  };

  if (err.name === 'ValidationError') {
    Object.values(err.errors).map((item) => {
      customError.type = item.path;
      customError.msg = item.message;
    })[0];
    customError.statusCode = 400;
    // customError.err = err;
  } else if (err.code && err.code === 11000) {
    const errType = Object.keys(err.keyValue)[0];
    customError.type = errType;
    customError.msg = `The ${errType} already Exists`;
    customError.statusCode = 400;
  } else if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  } else {
    customError.msg = 'Something went wrong :( please try again later!!';
  }

  console.log({ err });

  return res.status(customError.statusCode || 500).json(customError);
};

module.exports = errorHandler;
