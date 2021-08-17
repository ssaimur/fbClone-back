const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Must provide first name'],
      minlength: 3,
      maxlength: 20,
    },
    lastName: { type: String },
    username: { type: String, required: true, unique: true, min: 3, max: 20 },
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
    password: { type: String, required: true, min: 6 },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false },
    desc: { type: String, max: 500 },
    city: { type: String, max: 30 },
    from: { type: String, max: 30 },
    gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say'] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
