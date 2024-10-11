const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const DatabaseConnection = require("../models/DatabaseConnection");
const { connectToDatabase } = require("../utils/databaseDrivers");

// @desc    Add a new database connection
// @route   POST /api/database-connections
// @access  Private
exports.addDatabaseConnection = asyncHandler(async (req, res, next) => {
  req.body.company = req.user.company;

  const connection = await DatabaseConnection.create(req.body);

  res.status(201).json({
    success: true,
    data: connection,
  });
});

// @desc    Get all database connections for a company
// @route   GET /api/database-connections
// @access  Private
exports.getDatabaseConnections = asyncHandler(async (req, res, next) => {
  const connections = await DatabaseConnection.find({
    company: req.user.company,
  }).select("-password");

  res.status(200).json({
    success: true,
    count: connections.length,
    data: connections,
  });
});

// @desc    Update a database connection
// @route   PUT /api/database-connections/:id
// @access  Private
exports.updateDatabaseConnection = asyncHandler(async (req, res, next) => {
  let connection = await DatabaseConnection.findById(req.params.id);

  if (!connection) {
    return next(
      new ErrorResponse(
        `Database connection not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user belongs to the company that owns the connection
  if (connection.company.toString() !== req.user.company.toString()) {
    return next(
      new ErrorResponse(
        `User not authorized to update this database connection`,
        401
      )
    );
  }

  connection = await DatabaseConnection.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: connection,
  });
});

// @desc    Delete a database connection
// @route   DELETE /api/database-connections/:id
// @access  Private
exports.deleteDatabaseConnection = asyncHandler(async (req, res, next) => {
  const connection = await DatabaseConnection.findById(req.params.id);

  if (!connection) {
    return next(
      new ErrorResponse(
        `Database connection not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user belongs to the company that owns the connection
  if (connection.company.toString() !== req.user.company.toString()) {
    return next(
      new ErrorResponse(
        `User not authorized to delete this database connection`,
        401
      )
    );
  }

  await connection.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Test a database connection
// @route   POST /api/database-connections/:id/test
// @access  Private
exports.testDatabaseConnection = asyncHandler(async (req, res, next) => {
  const connection = await DatabaseConnection.findById(req.params.id).select(
    "+password"
  );

  if (!connection) {
    return next(
      new ErrorResponse(
        `Database connection not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user belongs to the company that owns the connection
  if (connection.company.toString() !== req.user.company.toString()) {
    return next(
      new ErrorResponse(
        `User not authorized to test this database connection`,
        401
      )
    );
  }

  try {
    const config = {
      type: connection.type,
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.getDecryptedPassword(),
      database: connection.database,
    };

    const dbConnection = await connectToDatabase(config);

    // Close the connection after successful test
    if (config.type === "MySQL") {
      await dbConnection.end();
    } else if (config.type === "PostgreSQL") {
      await dbConnection.end();
    } else if (config.type === "MongoDB") {
      await dbConnection.client.close();
    }

    res.status(200).json({
      success: true,
      message: "Database connection test successful",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Database connection test failed: ${error.message}`,
        500
      )
    );
  }
});
