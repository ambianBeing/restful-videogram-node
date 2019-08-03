const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/*representation of a comment document*/
const commentSchema = new Schema({
  content: { type: String, required: true },
  creatorName: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

/*representation of a video document*/
const videoSchema = new Schema({
  name: { type: String, required: true },
  creatorName: { type: String, required: true },
  uploadedAt: { type: Date, required: true },
  comments: [commentSchema]
});

/*representation of a user document*/
const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    authId: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    uploadedVids: [videoSchema]
  },
  { collection: "userStore" }
);

/*user model respresents the collection itself*/
const userModel = mongoose.model("userModel", userSchema);

module.exports = userModel;
