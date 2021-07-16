const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const router = express.Router();

// update user

router.put('/:id', async (req, res) => {
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
});

// delete user

router.delete('/:id', async (req, res) => {
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
});

// get a user

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, createdAt, updatedAt, ...restOfThem } = user._doc;
    res.status(200).json(restOfThem);
  } catch (error) {
    res.status(404).json(error);
  }
});

// follow a user

router.put('/:id/follow', async (req, res) => {
  if (req.params.id !== req.body.userId) {
    try {
      const userToFollow = await User.findById(req.params.id);
      const userWhoFollowing = await User.findById(req.body.userId);
      if (!userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $push: { followers: req.body.userId } });
        await userWhoFollowing.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json('user has been followed');
      } else {
        res.status(403).json('you already follow this user');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('you cant follow yourself');
  }
});

// unfollow a user

router.put('/:id/unfollow', async (req, res) => {
  if (req.params.id !== req.body.userId) {
    try {
      const userToFollow = await User.findById(req.params.id);
      const userWhoFollowing = await User.findById(req.body.userId);
      if (userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $pull: { followers: req.body.userId } });
        await userWhoFollowing.updateOne({
          $pull: { followings: req.params.id },
        });
        res.status(200).json('user has been unfollowed');
      } else {
        res.status(403).json("you don't follow this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('you cant unfollow yourself');
  }
});

module.exports = router;
