const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createQuestion,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");

const router = express.Router();

// Create Question
router.post("/", protect, authorize("admin"), createQuestion);

// Get Questions by Exam
router.get("/exam/:examId", protect, authorize("admin", "student"), getQuestionsByExam);

// Update Question
router.put("/:id", protect, authorize("admin"), updateQuestion);

// Delete Question
router.delete("/:id", protect, authorize("admin"), deleteQuestion);

module.exports = router;
