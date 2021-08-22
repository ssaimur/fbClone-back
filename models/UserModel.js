const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      minlength: [3, 'Invalid first name, minimum 3 characters'],
      maxlength: [15, 'Invalid first name, maximum 15 characters'],
    },
    lastName: {
      type: String,
      maxlength: [15, 'Invalid last name, maximum 15 characters'],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(?=.{5,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
        'Please provide a valid username',
      ],
    },
    dpImage: { type: String, default: '' },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      min: [6, 'Invalid password! minimum 6 characters'],
    },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false },
    desc: { type: String, max: 500 },
    city: { type: String, max: 30 },
    gender: { type: String, enum: ['Male', 'Female'] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
