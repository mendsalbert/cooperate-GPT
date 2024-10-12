const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const AIModel = require("../models/AIModel");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Anthropic = require("@anthropic-ai/sdk");

// @desc    Get all models for the logged-in user
// @route   GET /api/models
// @access  Private
exports.getModels = asyncHandler(async (req, res, next) => {
  const models = await AIModel.find({ user: req.user.id });
  res.status(200).json(models);
});

// @desc    Add a new AI model
// @route   POST /api/models
// @access  Private
exports.addModel = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Validate the API key based on the provider
  const { provider, apiKey } = req.body;

  // try {
  //   switch (provider) {
  //     case "OpenAI":
  //       const openai = new OpenAI({ apiKey });
  //       await openai.models.list();
  //       break;
  //     case "Gemini":
  //       const genAI = new GoogleGenerativeAI(apiKey);
  //       const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  //       await model.generateContent("Test");
  //       break;
  //     case "Claude":
  //       const anthropic = new Anthropic({ apiKey });
  //       await anthropic.messages.create({
  //         model: "claude-3-opus-20240229",
  //         max_tokens: 10,
  //         messages: [{ role: "user", content: "Test" }],
  //       });
  //       break;
  //     default:
  //       return next(new ErrorResponse(`Invalid provider: ${provider}`, 400));
  //   }
  // } catch (error) {

  //   return next(new ErrorResponse(`Invalid API key for ${provider}`, 400));
  // }

  const model = await AIModel.create(req.body);

  res.status(201).json({
    success: true,
    data: model,
  });
});

// @desc    Update an AI model
// @route   PUT /api/models/:id
// @access  Private
exports.updateModel = asyncHandler(async (req, res, next) => {
  let model = await AIModel.findById(req.params.id);

  if (!model) {
    return next(
      new ErrorResponse(`Model not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the model
  if (model.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this model`,
        401
      )
    );
  }

  model = await AIModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: model,
  });
});

// @desc    Delete an AI model
// @route   DELETE /api/models/:id
// @access  Private
exports.deleteModel = asyncHandler(async (req, res, next) => {
  const model = await AIModel.findById(req.params.id);

  if (!model) {
    return next(
      new ErrorResponse(`Model not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the model
  if (model.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this model`,
        401
      )
    );
  }

  await model.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Select a model for use
// @route   POST /api/models/:id/select
// @access  Private
exports.selectModel = asyncHandler(async (req, res, next) => {
  const model = await AIModel.findById(req.params.id);

  if (!model) {
    return next(
      new ErrorResponse(`Model not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the model
  if (model.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to select this model`,
        401
      )
    );
  }

  // TODO: Implement logic to select this model for use in queries

  res.status(200).json({
    success: true,
    data: "Model selected for use",
  });
});

// @desc    Fine-tune a model
// @route   POST /api/models/:id/fine-tune
// @access  Private
exports.fineTuneModel = asyncHandler(async (req, res, next) => {
  const model = await AIModel.findById(req.params.id);

  if (!model) {
    return next(
      new ErrorResponse(`Model not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the model
  if (model.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to fine-tune this model`,
        401
      )
    );
  }

  // TODO: Implement model fine-tuning logic

  res.status(200).json({
    success: true,
    data: "Model fine-tuning placeholder",
  });
});
