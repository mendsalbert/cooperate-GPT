const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getModels,
  addModel,
  updateModel,
  deleteModel,
  selectModel,
  fineTuneModel,
} = require("../controllers/modelController");
const router = express.Router();

router.use(protect); // Apply authentication middleware to all routes

router.route("/").get(getModels).post(addModel);

router.route("/:id").put(updateModel).delete(deleteModel);

router.post("/:id/select", selectModel);
router.post("/:id/fine-tune", fineTuneModel);

module.exports = router;
