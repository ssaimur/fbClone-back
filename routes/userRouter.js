const express = require('express');
const {
  updateUser,
  deleteUser,
  followUser,
  getUser,
  getAllUsers,
} = require('../controllers/userController');
const userRouter = express.Router();

/*
        PUT: Update a user
    */

userRouter
  .route('/:id')
  .put(updateUser)

  /*
        DELETE: Delete a user
    */

  .delete(deleteUser);

/*
        GET: Get a user
    */

userRouter.route('/').get(getUser);

/*
        GET: Get la the users
    */

userRouter.route('/people').get(getAllUsers);

/*
        PUT: Follow a user
    */

userRouter.route('/follow/:id').put(followUser);

module.exports = userRouter;
