const express = require("express");
const {
  aggregateData,
  retrieveData,
} = require("../controllers/dataController");
const router = express.Router();

router.get("/aggregate", aggregateData);
router.get("/retrieve", retrieveData);

module.exports = router;
