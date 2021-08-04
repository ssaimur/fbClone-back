const Posts = require('../models/PostModel');
const User = require('../models/UserModel');
const mongoose = require('mongoose');
const config = require('../config');
const crypto = require('crypto');

const url = config.mongoURI;
const connect = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

let gfs;

connect.once('open', () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: 'uploads',
  });
});

/*
        POST: Create a post 
    */

const createPost = async (req, res) => {
  console.log(req.body);
  // post the image
  const postCred = {
    caption: req.body.caption,
    userId: req.body.userId,
    filename: req.file.filename,
    fileId: req.file.id,
  };

  if (req.body.isDp) {
    postCred.isDp = true;
  }

  try {
    const newPost = await Posts.create(postCred);
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json('cannot create this post');
  }
};

/*
        POST: Upload profile picture
    */

const uploadProfilePicture = async (req, res) => {
  console.log(req.body);
  // post the image
  try {
    const response = await Posts.findOneAndUpdate(
      { filename: req.body.dpImage },
      { currentDp: false }
    );
    console.log(response);
  } catch (err) {
    console.log(err);
  }

  const postCred = {
    caption: req.body.caption,
    userId: req.body.userId,
    filename: req.file.filename,
    fileId: req.file.id,
    isDp: true,
    currentDp: true,
  };

  try {
    const newPost = await Posts.create(postCred);
    console.log(newPost);
  } catch (error) {
    console.log(error);
  }

  try {
    const updateInUsersEnd = await User.findOneAndUpdate(
      { _id: req.body.userId },
      { dpImage: newPost.filename }
    );
    console.log(updateInUsersEnd);
    res.status(200).json({ success: true, data: updateInUsersEnd });
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        PUT: Update a post
    */

const updatePost = async (req, res) => {
  console.log(req.body);
  const post = await Posts.findOne({ _id: req.params.id });
  try {
    if (post) {
      try {
        await post.updateOne({
          caption: req.body.caption,
        });
        return res.status(200).json({
          success: true,
          message: `File with ID: ${req.params.id} updated`,
        });
      } catch {
        return res.status(500).json(err);
      }
    } else {
      res.status(200).json({
        success: false,
        message: `File with ID: ${req.params.id} not found`,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/*
        DELETE: Delete a post
    */

const deletePost = async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();

      // check for the files and then delete from uploads.files
      gfs.delete(new mongoose.Types.ObjectId(req.body.fileId), (err, data) => {
        if (err) {
          return res.status(404).json({ err: err });
        }

        res.status(200).json({
          success: true,
          message: `File with ID ${req.params.id} is deleted`,
        });
      });
    } else {
      res.status(403).json('you can only delete your post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        PUT: Like/Unlike a post
    */

const likePost = async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    console.log(post);
    if (!post.likes.includes(req.body.uid)) {
      await post.updateOne({ $push: { likes: req.body.uid } });
      res.status(200).json('you like this post');
    } else {
      await post.updateOne({ $pull: { likes: req.body.uid } });
      res.status(200).json('you unlike this post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        GET: Get all posts from the database
    */

const getAllPosts = async (req, res) => {
  try {
    const posts = await Posts.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        GET: Get a post
    */

const getAPost = async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
      GET: Get newsfeed posts
  */

const getNewsFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Posts.find({ userId: currentUser._id });
    const friendsPost = await Promise.all(
      currentUser.followings.map((friendsId) => {
        return Posts.find({ userId: friendsId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPost));
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        GET: Get timeline posts
    */

const getTimeLinePosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Posts.find({ userId: user._id });
    console.log(posts);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        GET: Fetchs a particular file by an ID
    */

const getFileById = (req, res) => {
  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    if (!files[0] || files.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No files available',
      });
    }

    if (
      files[0].contentType === 'image/jpeg' ||
      files[0].contentType === 'image/jpg' ||
      files[0].contentType === 'image/png' ||
      files[0].contentType === 'image/svg+xml'
    ) {
      // render image to browser
      console.log('file request accepted');
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image',
      });
    }
  });
};

/*
        POST: Post comment on a post
    */

const postComment = async (req, res) => {
  const buf = crypto.randomBytes(16).toString('hex');
  try {
    const post = await Posts.findByIdAndUpdate(req.params.postId, {
      $push: {
        comments: { ...req.body, commentId: buf, createdAt: Date.now() },
      },
    });

    res.status(200).json({ buf });
  } catch (error) {
    res.status(500).json(error);
  }
};

/*
        POST: Remove comment on a post
    */

const removeComment = async (req, res) => {
  try {
    const post = await Posts.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: { commentId: req.body.commentId } },
    });

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createPost,
  uploadProfilePicture,
  updatePost,
  deletePost,
  likePost,
  getAllPosts,
  getAPost,
  getNewsFeedPosts,
  getTimeLinePosts,
  getFileById,
  postComment,
  removeComment,
};

// 60e4ea00db2ff620c49cb72f
