const CustomApiError = require('./customError');

class BadRequesError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequesError;
