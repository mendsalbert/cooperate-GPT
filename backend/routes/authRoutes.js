const express = require("express");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerCompanyAdmin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/register-company-admin", registerCompanyAdmin);
router.post("/login", login);
router.get("/verifyemail/:verificationToken", verifyEmail);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
