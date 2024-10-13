const express = require("express");
const {
  processQuery,
  getQueries,
  getChatHistory,
  uploadFile,
  getQueryHistory,
} = require("../controllers/queryController");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/").get(protect, getQueries).post(protect, processQuery);
router.route("/upload").post(protect, uploadFile);
router.route("/chat/:fileId").get(protect, getChatHistory);
router.route("/:id").get(protect, getQueryHistory);

module.exports = router;
