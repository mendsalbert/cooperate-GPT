const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a file name"],
  },
  originalName: {
    type: String,
    required: [true, "Please add the original file name"],
  },
  path: {
    type: String,
    required: [true, "Please add a file path"],
  },
  mimeType: {
    type: String,
    required: [true, "Please add a mime type"],
  },
  size: {
    type: Number,
    required: [true, "Please add the file size"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", FileSchema);
