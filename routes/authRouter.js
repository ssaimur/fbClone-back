const express = require('express');
const authRouter = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

/*
        POST: Register a user
    */

authRouter.route('/register').post(registerUser);

/*
        POST: Login a user
    */

authRouter.route('/login').post(loginUser);

module.exports = authRouter;
