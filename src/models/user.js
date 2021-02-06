const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  creatorName: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

const videoSchema = new Schema({
  name: { type: String, required: true },
  creatorName: { type: String, required: true },
  uploadedAt: { type: Date, required: true },
  fileLocation: { type: String, required: true },
  fileAbsPath: { type: String, required: true },
  encodedName: { type: String, required: true },
  comments: [commentSchema],
});

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    authId: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    uploadedVids: [videoSchema],
  },
  { collection: "userStore" }
);

const userModel = mongoose.model("userModel", userSchema);

module.exports = userModel;
