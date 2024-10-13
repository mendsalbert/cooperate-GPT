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

// @desc    Create a new chat or add to existing chat
// @route   POST /api/queries
// @access  Private
exports.processQuery = asyncHandler(async (req, res, next) => {
  const { text, modelId, chatId } = req.body;
  let file;

  if (!text && !req.files) {
    return next(new ErrorResponse("Please provide query text or a file", 400));
  }

  if (!modelId) {
    return next(new ErrorResponse("Please provide a model ID", 400));
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

  let query;
  if (chatId) {
    query = await Query.findById(chatId);
    if (!query) {
      return next(new ErrorResponse("Chat not found", 404));
    }
    if (query.user.toString() !== req.user.id) {
      return next(new ErrorResponse("Not authorized to access this chat", 401));
    }
  } else {
    query = new Query({
      title: text ? text.substring(0, 30) + "..." : "File Upload",
      user: req.user.id,
      model: modelId,
      file: file ? file._id : undefined,
      messages: [],
    });
  }

  // Add user message to the chat
  query.messages.push({ role: "user", content: text || "File uploaded" });

  let response;
  try {
    const genAI = new GoogleGenerativeAI(model.apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let content = [{ text: text || "Process the uploaded file" }];

    if (file) {
      const fileManager = new GoogleAIFileManager(model.apiKey);
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

    // Add AI response to the chat
    query.messages.push({ role: "assistant", content: response });

    await query.save();

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

// @desc    Get all chats for a user
// @route   GET /api/queries
// @access  Private
exports.getQueries = asyncHandler(async (req, res, next) => {
  const queries = await Query.find({ user: req.user.id })
    .select("title createdAt updatedAt messages")
    .sort("-updatedAt");

  res.status(200).json({
    success: true,
    count: queries.length,
    data: queries,
  });
});

// @desc    Get a specific chat
// @route   GET /api/queries/:id
// @access  Private
exports.getQuery = asyncHandler(async (req, res, next) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    return next(
      new ErrorResponse(`Chat not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the chat
  if (query.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to access this chat`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: query,
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
