const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please add a query text"],
    trim: true,
  },
  response: {
    type: String,
    required: [true, "Response is required"],
  },
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
});

module.exports = mongoose.model("Query", QuerySchema);
