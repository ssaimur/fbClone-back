const express = require('express');
const User = require('../models/UserModel');
const authRouter = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
} = require('../controllers/authController');

/*
        POST: Register a user
    */

authRouter.route('/register').post(registerUser);

/*
        POST: Login a user
    */

authRouter.route('/login').post(loginUser);

/*
        POST: Logout a user
    */

authRouter.route('/logout').post(logoutUser);

/*
        POST: Search a user
    */

authRouter.get('/search', function (req, res, next) {
  const search = req.query.search;

  User.find(
    [
      {
        $search: {
          index: 'search users',
          text: {
            query: 'ssaimur',
            path: {
              wildcard: '*',
            },
          },
        },
      },
    ],
    {
      _id: 0,
      __v: 0,
    },
    function (err, data) {
      res.json(data);
    }
  );
});

module.exports = authRouter;
