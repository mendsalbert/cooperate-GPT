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

// Base routes
router.route("/").get(getCompanies).post(registerCompany);

// Stats route
router.get("/stats", getCompanyStats);

// Search route
router.get("/search", searchCompanies);

// Individual company routes
router.route("/:id").get(getCompany).put(updateCompany).delete(deleteCompany);

module.exports = router;
