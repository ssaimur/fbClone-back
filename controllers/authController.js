const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

/*
        POST: Register a user
    */

const registerUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

/*
        POST: Login a user
    */

const loginUser = async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).send('user not found');

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).send('wrong password');

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

module.exports = { registerUser, loginUser };
