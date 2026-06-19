const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Route    GET /api/students
// Desc     Get all registered students
// Access   Private (Admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
