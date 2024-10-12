const express = require("express");
const {
  registerCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  searchCompanies,
} = require("../controllers/companyController");

const router = express.Router();

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Register a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of companies
 */
router.route("/").post(registerCompany).get(getCompanies);

/**
 * @swagger
 * /api/companies/stats:
 *   get:
 *     summary: Get company statistics
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Company statistics
 */
router.get("/stats", getCompanyStats);

/**
 * @swagger
 * /api/companies/search:
 *   get:
 *     summary: Search companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Bad request
 */
router.get("/search", searchCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a single company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
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
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 */
router.route("/:id").get(getCompany).put(updateCompany).delete(deleteCompany);

module.exports = router;
