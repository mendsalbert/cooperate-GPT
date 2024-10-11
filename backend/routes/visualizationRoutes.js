const express = require("express");
const {
  generateGraph,
  exportToExcel,
  exportToCSV,
  exportToImage,
} = require("../controllers/visualizationController");
const router = express.Router();

router.post("/graph", generateGraph);
router.get("/export/excel", exportToExcel);
router.get("/export/csv", exportToCSV);
router.get("/export/image", exportToImage);

module.exports = router;
