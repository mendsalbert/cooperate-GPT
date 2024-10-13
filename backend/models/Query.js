const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const QuerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a chat title"],
    trim: true,
  },
  messages: [MessageSchema],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  model: {
    type: mongoose.Schema.ObjectId,
    ref: "AIModel",
    required: true,
  },
  file: {
    type: mongoose.Schema.ObjectId,
    ref: "File",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Query", QuerySchema);
