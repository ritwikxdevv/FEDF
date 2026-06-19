const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, authorize("admin", "student"), getProfile);
router.put("/profile", protect, authorize("admin", "student"), updateProfile);

module.exports = router;