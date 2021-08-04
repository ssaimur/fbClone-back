const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    username: { type: String, required: true, unique: true, min: 3, max: 20 },
    dpImage: { type: String, default: '' },
    email: { type: String, required: true, unique: true, max: 40 },
    password: { type: String, required: true, min: 6 },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false },
    desc: { type: String, max: 50 },
    city: { type: String, max: 50 },
    from: { type: String, max: 50 },
    gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say'] },
    relationship: { type: Number, enum: [1, 2, 3] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
