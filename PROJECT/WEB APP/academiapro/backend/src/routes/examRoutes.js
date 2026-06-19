const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  assignExam
} = require("../controllers/examController");

const router = express.Router();

// Route    POST /api/exams
// Desc     Create a new exam
// Access   Private (Teacher/Admin protected by middleware)
router.post("/", protect, authorize("admin"), createExam);

// Route    POST /api/exams/:id/assign
// Desc     Assign an exam to students
// Access   Private (Teacher/Admin protected by middleware)
router.post("/:id/assign", protect, authorize("admin"), assignExam);

// Route    GET /api/exams
// Desc     Get all exams
// Access   Private
router.get("/", protect, authorize("admin", "student"), getExams);

// Route    PUT /api/exams/:id
// Desc     Update a specific exam
// Access   Private (Teacher/Admin protected by middleware)
router.put("/:id", protect, authorize("admin"), updateExam);

// Route    DELETE /api/exams/:id
// Desc     Delete a specific exam
// Access   Private (Teacher/Admin protected by middleware)
router.delete("/:id", protect, authorize("admin"), deleteExam);

module.exports = router;
