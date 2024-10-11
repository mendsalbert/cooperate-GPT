const express = require("express");
const {
  addDatabaseConnection,
  getDatabaseConnections,
  updateDatabaseConnection,
  deleteDatabaseConnection,
  testDatabaseConnection,
} = require("../controllers/databaseConnectionController");

const router = express.Router();

router.route("/").get(getDatabaseConnections).post(addDatabaseConnection);

router
  .route("/:id")
  .put(updateDatabaseConnection)
  .delete(deleteDatabaseConnection);

router.post("/:id/test", testDatabaseConnection);

module.exports = router;
