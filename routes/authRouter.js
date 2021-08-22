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

module.exports = authRouter;
