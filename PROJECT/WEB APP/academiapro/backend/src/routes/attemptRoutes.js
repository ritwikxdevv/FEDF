const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const { startExam, getExamQuestions } = require("../controllers/examAttemptController");
const { submitExam } = require("../controllers/submissionController");

const router = express.Router();

// Route    POST /api/attempts/start/:examId
// Desc     Student starts an exam attempt (creates submission record)
// Access   Private (Student only)
router.post("/start/:examId", protect, authorize("student"), startExam);

// Route    GET /api/attempts/:examId/questions
// Desc     Fetch exam questions for an active attempt (hides correctAnswer)
// Access   Private (Student only)
router.get("/:examId/questions", protect, authorize("student"), getExamQuestions);

// Route    POST /api/attempts/submit/:examId
// Desc     Submit exam answers
// Access   Private (Student only)
router.post("/submit/:examId", protect, authorize("student"), submitExam);

module.exports = router;
