const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Query = require("../models/Query");
const File = require("../models/File");
const AIModel = require("../models/AIModel");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");

// @desc    Process user input query with file upload
// @route   POST /api/queries
// @access  Private
exports.processQuery = asyncHandler(async (req, res, next) => {
  const { text, modelId } = req.body;
  let file;

  if (!text || !modelId) {
    return next(
      new ErrorResponse("Please provide query text and model ID", 400)
    );
  }

  const model = await AIModel.findById(modelId).select("+apiKey");
  if (!model) {
    return next(new ErrorResponse("Model not found", 404));
  }

  // Handle file upload if present
  if (req.files && req.files.file) {
    const uploadedFile = req.files.file;
    const fileName = `${Date.now()}_${uploadedFile.name}`;
    const uploadDir = path.join(__dirname, "..", "uploads");

    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await uploadedFile.mv(filePath);

    file = await File.create({
      name: fileName,
      originalName: uploadedFile.name,
      path: filePath,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
      user: req.user.id,
    });
  }

  let response;

  try {
    const genAI = new GoogleGenerativeAI(model.apiKey);
    const fileManager = new GoogleAIFileManager(model.apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let content = [{ text }];

    if (file) {
      const uploadResponse = await fileManager.uploadFile(file.path, {
        mimeType: file.mimeType,
        displayName: file.originalName,
      });

      content.unshift({
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      });
    }

    const result = await geminiModel.generateContent(content);
    response = result.response.text();

    const query = await Query.create({
      text,
      response,
      user: req.user.id,
      model: modelId,
      file: file ? file._id : undefined,
    });

    res.status(201).json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Error processing query:", error);
    return next(
      new ErrorResponse(`Error processing query: ${error.message}`, 500)
    );
  }
});

// @desc    Get all queries for a user
// @route   GET /api/queries
// @access  Private
exports.getQueries = asyncHandler(async (req, res, next) => {
  const queries = await Query.find({ user: req.user.id }).populate(
    "file",
    "name originalName"
  );

  res.status(200).json({
    success: true,
    count: queries.length,
    data: queries,
  });
});

// @desc    Get chat history for a specific file
// @route   GET /api/queries/chat/:fileId
// @access  Private
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const fileId = req.params.fileId;

  const chatHistory = await Query.find({ user: req.user.id, file: fileId })
    .sort({ createdAt: 1 })
    .populate("model", "name provider")
    .populate("file", "name originalName");

  res.status(200).json({
    success: true,
    count: chatHistory.length,
    data: chatHistory,
  });
});

// @desc    Upload a file
// @route   POST /api/queries/upload
// @access  Private
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const uploadedFile = req.files.file;
  const fileName = `${Date.now()}_${uploadedFile.name}`;
  const uploadDir = path.join(__dirname, "..", "uploads");

  // Create the uploads directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);

  await uploadedFile.mv(filePath);

  const file = await File.create({
    name: fileName,
    originalName: uploadedFile.name,
    path: filePath,
    mimeType: uploadedFile.mimetype,
    size: uploadedFile.size,
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: file,
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Create user
  const user = await User.create({
    email,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
