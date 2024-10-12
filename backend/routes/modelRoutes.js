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

router.use(protect);

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get all AI models for a user
 *     tags: [Models]
 *     responses:
 *       200:
 *         description: List of AI models
 *   post:
 *     summary: Add a new AI model
 *     tags: [Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIModel'
 *     responses:
 *       201:
 *         description: AI model added successfully
 *       400:
 *         description: Bad request
 */
router.route("/").get(getModels).post(addModel);

/**
 * @swagger
 * /api/models/{id}:
 *   put:
 *     summary: Update an AI model
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIModel'
 *     responses:
 *       200:
 *         description: AI model updated successfully
 *       404:
 *         description: AI model not found
 *   delete:
 *     summary: Delete an AI model
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI model deleted successfully
 *       404:
 *         description: AI model not found
 */
router.route("/:id").put(updateModel).delete(deleteModel);

/**
 * @swagger
 * /api/models/{id}/select:
 *   post:
 *     summary: Select an AI model for use
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI model selected successfully
 *       404:
 *         description: AI model not found
 */
router.post("/:id/select", selectModel);

/**
 * @swagger
 * /api/models/{id}/fine-tune:
 *   post:
 *     summary: Fine-tune an AI model
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI model fine-tuning started
 *       404:
 *         description: AI model not found
 */
router.post("/:id/fine-tune", fineTuneModel);

module.exports = router;
