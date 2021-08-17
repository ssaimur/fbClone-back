const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.newUser;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.json({ err: 'userNot authenticated' });
      } else {
        next();
      }
    });
  } else {
    res.json({ err: 'token required' });
  }
};

module.exports = requireAuth;
