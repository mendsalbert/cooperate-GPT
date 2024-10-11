const Company = require("../models/Company");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Register company
// @route   POST /api/companies
// @access  Private/Admin
exports.registerCompany = asyncHandler(async (req, res, next) => {
  // Check if company with the same name already exists
  const existingCompany = await Company.findOne({ name: req.body.name });
  if (existingCompany) {
    return next(
      new ErrorResponse(`Company ${req.body.name} already exists`, 400)
    );
  }

  const company = await Company.create(req.body);

  res.status(201).json({
    success: true,
    data: company,
  });
});

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin
exports.getCompanies = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Company.countDocuments();

  const query = Company.find().skip(startIndex).limit(limit);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Filtering
  const companies = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: companies.length,
    pagination,
    data: companies,
  });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private/Admin
exports.getCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Company not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: company,
  });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private/Admin
exports.updateCompany = asyncHandler(async (req, res, next) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Company not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if updating name and if it already exists
  if (req.body.name && req.body.name !== company.name) {
    const existingCompany = await Company.findOne({ name: req.body.name });
    if (existingCompany) {
      return next(
        new ErrorResponse(`Company ${req.body.name} already exists`, 400)
      );
    }
  }

  company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: company,
  });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Admin
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Company not found with id of ${req.params.id}`, 404)
    );
  }

  await company.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get company statistics
// @route   GET /api/companies/stats
// @access  Private/Admin
exports.getCompanyStats = asyncHandler(async (req, res, next) => {
  const stats = await Company.aggregate([
    {
      $group: {
        _id: null,
        totalCompanies: { $sum: 1 },
        averageEmployees: { $avg: "$employeeCount" },
        totalRevenue: { $sum: "$annualRevenue" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Search companies
// @route   GET /api/companies/search
// @access  Private/Admin
exports.searchCompanies = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ErrorResponse("Please provide a search query", 400));
  }

  const companies = await Company.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { industry: { $regex: query, $options: "i" } },
    ],
  });

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies,
  });
});
