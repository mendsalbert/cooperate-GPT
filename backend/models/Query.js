const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Query:
 *       type: object
 *       required:
 *         - text
 *         - response
 *         - user
 *         - model
 *       properties:
 *         text:
 *           type: string
 *           description: The query text
 *         response:
 *           type: string
 *           description: The AI-generated response
 *         user:
 *           type: string
 *           description: The ID of the user who made the query
 *         model:
 *           type: string
 *           description: The ID of the AI model used
 *         file:
 *           type: string
 *           description: The ID of the associated file (if any)
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the query was created
 */
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
