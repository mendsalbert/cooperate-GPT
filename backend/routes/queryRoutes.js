const express = require("express");
const { protect } = require("../middleware/auth");
const {
  processQuery,
  getQueries,
  getQuery,
  deleteQuery,
  uploadFile,
} = require("../controllers/queryController");
const router = express.Router();

router.use(protect);

router.route("/").post(processQuery).get(getQueries);
router.route("/:id").get(getQuery).delete(deleteQuery);
router.post("/upload", uploadFile);

module.exports = router;
