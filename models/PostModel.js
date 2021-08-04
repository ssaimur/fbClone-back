const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    caption: {
      // required: true,
      type: String,
    },
    filename: {
      required: true,
      type: String,
    },
    fileId: {
      required: true,
      type: String,
    },
    userId: {
      required: true,
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
    isDp: {
      type: Boolean,
      default: false,
    },
    currentDp: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
