const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const queryRoutes = require("./queryRoutes");
const dataRoutes = require("./dataRoutes");
const companyRoutes = require("./companyRoutes");
const visualizationRoutes = require("./visualizationRoutes");
const modelRoutes = require("./modelRoutes");
const databaseConnectionRoutes = require("./databaseConnectionRoutes");

router.use("/auth", authRoutes);
router.use("/queries", queryRoutes);
router.use("/companies", companyRoutes);
router.use("/data", dataRoutes);
router.use("/visualizations", visualizationRoutes);
router.use("/models", modelRoutes);
router.use("/database-connections", databaseConnectionRoutes);

module.exports = router;
