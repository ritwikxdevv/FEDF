const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getMyResults,
  getAllResults
} = require("../controllers/resultsController");

const router = express.Router();

// Route    GET /api/results/my-results
// Desc     Fetch all graded/submitted exams for the currently logged-in student
// Access   Private (Student protected by middleware)
router.get("/my-results", protect, authorize("admin", "student"), getMyResults);

// Route    GET /api/results/all
// Desc     Fetch all platform results (Supports ?examId query filter)
// Access   Private (Admin protected by middleware)
router.get("/all", protect, authorize("admin"), getAllResults);

module.exports = router;
