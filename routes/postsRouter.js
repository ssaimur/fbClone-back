const router = require('express').Router();
const Posts = require('../models/PostModel');
const User = require('../models/UserModel');

// create a post

router.post('/', async (req, res) => {
  try {
    const newPost = await Posts.create(req.body);
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json('cannot create this post');
  }
});

// update a post

router.put('/:id', async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json('your post has been updated');
    } else {
      res.status(403).json('you can only change your post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete a post

router.delete('/:id', async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('your post has been deleted');
    } else {
      res.status(403).json('you can only delete your post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like a post

router.put('/:id/like', async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('you like this post');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('you unlike this post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get a post

router.get('/:id', async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get timeline post

router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Posts.find({ userId: currentUser._id });
    const friendsPost = await Promise.all(
      currentUser.followings.map((friendsId) => {
        return Posts.find({ userId: friendsId });
      })
    );
    res.status(200).json([...userPosts, ...friendsPost]);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
