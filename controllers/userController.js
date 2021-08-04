const bcrypt = require('bcrypt');
const User = require('../models/UserModel');

/*
        PUT: Update a user
    */

const updateUser = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(15);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    try {
      await User.findByIdAndUpdate(req.params.id, req.body);

      res.status(200).json('account has been updated');
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('you can only change your account');
  }
};

/*
        DELETE: Delete a user
    */

const deleteUser = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete({ _id: req.params.id });
      console.log(user);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('you can only delete your account');
  }
};

/*
        GET: Get a user
    */

const getUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    const username = req.query.username;
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username });
    const { password, createdAt, updatedAt, ...restOfThem } = user._doc;
    res.status(200).json(restOfThem);
  } catch (error) {
    res.status(404).json(error);
  }
};

/*
        PUT: Follow a user
    */

const followUser = async (req, res) => {
  if (req.params.id !== req.body.userId) {
    try {
      // get who to follow and who is following
      const userToFollow = await User.findById(req.params.id);
      const userWhoFollowing = await User.findById(req.body.userId);

      // if the user is not following then follow
      if (!userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $push: { followers: req.body.userId } });
        await userWhoFollowing.updateOne({
          $push: { followings: req.params.id },
        });
        console.log('followed');
        res.status(200).json('user has been followed');
      }

      // if the user is following then unfollow
      else {
        await userToFollow.updateOne({ $pull: { followers: req.body.userId } });
        await userWhoFollowing.updateOne({
          $pull: { followings: req.params.id },
        });
        console.log('unfollowed');
        res.status(200).json('user has been unfollowed');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('you cant follow yourself');
  }
};

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  followUser,
};
