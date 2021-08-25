const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../middlewares/asyncWrapper');

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

/*
        POST: Register a user
    */

const registerUser = asyncWrapper(async (req, res) => {
  const salt = await bcrypt.genSalt(15);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
  });

  const token = createToken(newUser._id);

  res.cookie('newUser', token, {
    httpOnly: true,
    maxAge: maxAge * 1000,
    sameSite: 'none',
    secure: true,
  });
  res.status(200).json({ success: true, newUser });
});

/*
        POST: Login a user
    */

const loginUser = asyncWrapper(async (req, res) => {
  const customError = {
    success: false,
  };

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    customError.type = 'email';
    customError.msg = 'This email is not registered!';
    return res.status(400).json(customError);
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    customError.type = 'password';
    customError.msg = 'Incorrect password!';
    return res.status(400).json(customError);
  }
  const token = createToken(user._id);

  res.cookie('newUser', token, {
    httpOnly: true,
    maxAge: maxAge * 1000,
    sameSite: 'none',
    secure: true,
  });

  const { password, ...restOfThem } = user._doc;

  res.status(200).json({ success: true, user: restOfThem });
});

/*
        POST: Logout a user
    */

const logoutUser = async (req, res) => {
  res.cookie('newUser', 'token deleted', {
    maxAge: 1,
    sameSite: 'none',
    secure: true,
  });

  res.json({ success: true, message: 'User successfully logged out' });
};

module.exports = { registerUser, loginUser, logoutUser };
