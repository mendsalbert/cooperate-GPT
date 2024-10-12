const express = require("express");
const { protect } = require("../middleware/auth");
const {
  processQuery,
  getQueries,
  getChatHistory,
  uploadFile,
} = require("../controllers/queryController");
const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/queries:
 *   post:
 *     summary: Process a query
 *     tags: [Queries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - modelId
 *             properties:
 *               text:
 *                 type: string
 *               modelId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Query processed successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Model not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all queries for a user
 *     tags: [Queries]
 *     responses:
 *       200:
 *         description: List of queries
 *       500:
 *         description: Server error
 */
router.route("/").post(processQuery).get(getQueries);

/**
 * @swagger
 * /api/queries/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post("/upload", uploadFile);

/**
 * @swagger
 * /api/queries/chat/{fileId}:
 *   get:
 *     summary: Get chat history for a specific file
 *     tags: [Queries]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/chat/:fileId", getChatHistory);

module.exports = router;
