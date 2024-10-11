const express = require("express");
const { protect } = require("../middleware/auth");
const {
  processQuery,
  getQueries,
  getChatHistory,
} = require("../controllers/queryController");
const router = express.Router();

router.use(protect);

router.route("/").post(processQuery).get(getQueries);

router.get("/chat/:fileId", getChatHistory);

module.exports = router;
