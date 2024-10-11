const mongoose = require("mongoose");
const crypto = require("crypto");

const DatabaseConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this connection"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  type: {
    type: String,
    required: [true, "Please specify the database type"],
    enum: ["MySQL", "PostgreSQL", "MongoDB"],
  },
  host: {
    type: String,
    required: [true, "Please provide the database host"],
  },
  port: {
    type: Number,
    required: [true, "Please provide the database port"],
  },
  database: {
    type: String,
    required: [true, "Please provide the database name"],
  },
  username: {
    type: String,
    required: [true, "Please provide the database username"],
  },
  password: {
    type: String,
    required: [true, "Please provide the database password"],
    select: false,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Company",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
DatabaseConnectionSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const cipher = crypto.createCipher(
    "aes-256-cbc",
    process.env.DATABASE_ENCRYPTION_KEY
  );
  let encryptedPassword = cipher.update(this.password, "utf8", "hex");
  encryptedPassword += cipher.final("hex");
  this.password = encryptedPassword;

  next();
});

// Decrypt password
DatabaseConnectionSchema.methods.getDecryptedPassword = function () {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.DATABASE_ENCRYPTION_KEY
  );
  let decryptedPassword = decipher.update(this.password, "hex", "utf8");
  decryptedPassword += decipher.final("utf8");
  return decryptedPassword;
};

module.exports = mongoose.model("DatabaseConnection", DatabaseConnectionSchema);
