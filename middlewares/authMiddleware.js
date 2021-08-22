const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.newUser;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.json({ err: 'userNot authenticated' });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({
      success: false,
      data: null,
      msg: 'token required',
      statusCode: 401,
    });
  }
};

module.exports = requireAuth;
