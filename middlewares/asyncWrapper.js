const asyncWrapper = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      console.log(err.keyValue, err.code);
      next(err);
    }
  };
};

module.exports = asyncWrapper;
