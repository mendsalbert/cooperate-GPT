const mongoose = require("mongoose");

const AIModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a model name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  provider: {
    type: String,
    enum: ["OpenAI", "Gemini", "Claude"],
    required: true,
  },
  apiKey: {
    type: String,
    required: [true, "Please provide an API key"],
    select: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AIModel", AIModelSchema);
