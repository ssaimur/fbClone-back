class CustomApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = CustomApiError;
