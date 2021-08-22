const Posts = require('../models/PostModel');
const User = require('../models/UserModel');
const mongoose = require('mongoose');
const crypto = require('crypto');
const asyncWrapper = require('../middlewares/asyncWrapper');

const url = process.env.MONGO_URI;
const connect = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

mongoose.set('returnOriginal', false);

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

const createPost = asyncWrapper(async (req, res) => {
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

  const newPost = await Posts.create(postCred);
  res.status(200).json({ success: true, data: newPost });
});

/*
        POST: Upload profile picture
    */

const uploadProfilePicture = asyncWrapper(async (req, res) => {
  // post the image

  const postCred = {
    caption: req.body.caption,
    userId: req.body.userId,
    filename: req.file.filename,
    fileId: req.file.id,
    isDp: true,
  };

  const newPost = await Posts.create(postCred);

  const updateInUsersEnd = await User.findOneAndUpdate(
    { _id: req.body.userId },
    { dpImage: newPost.filename }
  );

  res.status(200).json({
    success: true,
    data: newPost,
    user: updateInUsersEnd,
  });
});

/*
        PUT: Update a post
    */

const updatePost = asyncWrapper(async (req, res) => {
  const post = await Posts.findByIdAndUpdate(req.params.id, {
    caption: req.body.caption,
  });

  return res.status(200).json({
    success: true,
    message: `File with ID: ${req.params.id} updated`,
    data: post,
  });
});

/*
        DELETE: Delete a post
    */

const deletePost = asyncWrapper(async (req, res) => {
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
});

/*
        PUT: Like/Unlike a post
    */

const likePost = asyncWrapper(async (req, res) => {
  const post = await Posts.findById(req.params.id);

  if (!post.likes.includes(req.body.uid)) {
    await post.updateOne({ $push: { likes: req.body.uid } });
    res.status(200).json('you like this post');
  } else {
    await post.updateOne({ $pull: { likes: req.body.uid } });
    res.status(200).json('you unlike this post');
  }
});

/*
        GET: Get all posts from the database
    */

const getAllPosts = asyncWrapper(async (req, res) => {
  const posts = await Posts.find({});
  res.status(200).json(posts);
});

/*
        GET: Get a post
    */

const getAPost = asyncWrapper(async (req, res) => {
  const post = await Posts.findById(req.params.id);
  res.status(200).json(post);
});

/*
      GET: Get newsfeed posts
  */

const getNewsFeedPosts = asyncWrapper(async (req, res) => {
  const currentUser = await User.findById(req.params.userId);
  const userPosts = await Posts.find({ userId: currentUser._id });
  const friendsPost = await Promise.all(
    currentUser.followings.map((friendsId) => {
      return Posts.find({ userId: friendsId });
    })
  );
  res.status(200).json(userPosts.concat(...friendsPost));
});

/*
        GET: Get timeline posts
    */

const getTimeLinePosts = asyncWrapper(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  const posts = await Posts.find({ userId: user._id });

  res.status(200).json(posts);
});

/*
        POST: Post comment on a post
    */

const postComment = asyncWrapper(async (req, res) => {
  const buf = crypto.randomBytes(16).toString('hex');

  const post = await Posts.findByIdAndUpdate(req.params.postId, {
    $push: {
      comments: { ...req.body, commentId: buf, createdAt: Date.now() },
    },
  });

  res.status(200).json({ buf });
});

/*
        POST: Remove comment on a post
    */

const removeComment = asyncWrapper(async (req, res) => {
  const post = await Posts.findByIdAndUpdate(req.params.postId, {
    $pull: { comments: { commentId: req.body.commentId } },
  });

  res.status(200).json({ post });
});

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

      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image',
      });
    }
  });
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
