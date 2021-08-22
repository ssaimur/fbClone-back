const bcrypt = require('bcrypt');
const asyncWrapper = require('../middlewares/asyncWrapper');
const User = require('../models/UserModel');

/*
        PUT: Update a user 
        *** not finalized, more work is needed
    */

const updateUser = asyncWrapper(async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(15);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    await User.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json('account has been updated');
  } else {
    res.status(403).json('you can only change your account');
  }
});

/*
        DELETE: Delete a user
    */

const deleteUser = asyncWrapper(async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    const user = await User.findByIdAndDelete({ _id: req.params.id });

    res.status(200).json(user);
  } else {
    res.status(403).json('you can only delete your account');
  }
});

/*
        GET: Get a user
    */

const getUser = asyncWrapper(async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ username });
  const { password, ...restOfThem } = user._doc;
  res.status(200).json(restOfThem);
});

/*
        GET: Get all the users
    */

const getAllUsers = asyncWrapper(async (req, res) => {
  const people = await User.find({});

  const newPeople = people.map((item) => {
    const { username, dpImage, firstName, lastName, gender, followers, _id } =
      item._doc;
    newItem = {
      username,
      dpImage,
      firstName,
      lastName,
      gender,
      followers,
      _id,
    };
    item = newItem;
    return item;
  });

  res.status(200).json({ success: true, data: newPeople });
});

/*
        PUT: Follow a user
    */

const followUser = asyncWrapper(async (req, res) => {
  if (req.params.id !== req.body.userId) {
    // get who to follow and who is following
    const userToFollow = await User.findById(req.params.id);
    const userWhoFollowing = await User.findById(req.body.userId);

    // if the user is not following then follow
    if (!userToFollow.followers.includes(req.body.userId)) {
      await userToFollow.updateOne({ $push: { followers: req.body.userId } });
      await userWhoFollowing.updateOne({
        $push: { followings: req.params.id },
      });

      res.status(200).json('user has been followed');
    }

    // if the user is following then unfollow
    else {
      await userToFollow.updateOne({ $pull: { followers: req.body.userId } });
      await userWhoFollowing.updateOne({
        $pull: { followings: req.params.id },
      });

      res.status(200).json('user has been unfollowed');
    }
  } else {
    res.status(403).json('you cant follow yourself');
  }
});

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  followUser,
};
