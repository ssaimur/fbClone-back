const express = require('express');
const postRouter = express.Router();

const {
  createPost,
  uploadProfilePicture,
  updatePost,
  likePost,
  getAllPosts,
  getAPost,
  getTimeLinePosts,
  getNewsFeedPosts,
  deletePost,
  getFileById,
  postComment,
  removeComment,
} = require('../controllers/postController');

module.exports = (upload) => {
  /*
        POST: Create a post 
    */

  postRouter.route('/upload').post(upload.single('file'), createPost);

  /*
        POST: Upload profile picture
    */

  postRouter
    .route('/dp/upload')
    .post(upload.single('file'), uploadProfilePicture);

  /*
        PUT: Update a post
    */

  postRouter.route('/update/:id').put(updatePost);

  /*
        DELETE: Delete a post
    */

  postRouter.route('/delete/:id').delete(deletePost);

  /*
        PUT: Like/Unlike a post
    */

  postRouter.route('/like/:id').put(likePost);

  /*
        GET: Get all posts from the database
    */

  postRouter.route('/explore').get(getAllPosts);

  /*
        GET: Get a post
    */

  postRouter.route('/:id').get(getAPost);

  /*
        GET: Get newsfeed posts
    */

  postRouter.route('/newsfeed/:userId').get(getNewsFeedPosts);

  /*
        GET: Get timeline posts
    */

  postRouter.route('/profile/:username').get(getTimeLinePosts);

  /*
        GET: Fetchs a particular file by an ID
    */

  postRouter.route('/file/:filename').get(getFileById);

  /*
        POST: Post comment on a post
    */

  postRouter.route('/comment/:postId').post(postComment);

  /*
        POST: Remove comment on a post
    */

  postRouter.route('/comment/remove/:postId').post(removeComment);

  return postRouter;
};
