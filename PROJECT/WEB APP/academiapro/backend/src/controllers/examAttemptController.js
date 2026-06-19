const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");

// @desc    Start an exam attempt
// @route   POST /api/attempts/start/:examId
// @access  Private (Student)
const startExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Verify student authentication
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students are authorized to start exams." });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Authorization: Student must be assigned this exam
    const isAssigned =
      exam.isAssignedToAll ||
      exam.assignedTo.some(id => id.toString() === req.user._id.toString());
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this exam." });
    }

    // Prevent multiple attempts: Check if a submission already exists for this student + exam
    const existingSubmission = await Submission.findOne({
      studentId: req.user._id,
      examId: examId
    });

    if (existingSubmission) {
      if (existingSubmission.status === "in-progress") {
        return res.status(200).json({
          message: "Resuming in-progress exam attempt.",
          submission: existingSubmission
        });
      }
      return res.status(400).json({ 
        message: "You have already started or completed this exam.",
        submissionId: existingSubmission._id,
        status: existingSubmission.status
      });
    }

    // Initialize a new in-progress submission
    const newSubmission = await Submission.create({
      studentId: req.user._id,
      examId: examId,
      answers: [],
      status: "in-progress",
      startedAt: Date.now()
    });

    res.status(201).json({
      message: "Exam started successfully.",
      submission: newSubmission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all questions for a selected exam
// @route   GET /api/attempts/:examId/questions
// @access  Private (Student)
const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // Verify student authentication
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students are authorized to view exam questions." });
    }

    // Verify the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Authorization: Student must be assigned this exam
    const isAssigned =
      exam.isAssignedToAll ||
      exam.assignedTo.some(id => id.toString() === req.user._id.toString());
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this exam." });
    }

    // Crucial Security Step: Ensure the student has actually started the exam via /start before seeing questions
    const activeSubmission = await Submission.findOne({
      studentId: req.user._id,
      examId: examId
    });

    if (!activeSubmission) {
      return res.status(403).json({ message: "You must officially start the exam before viewing the questions." });
    }

    // Fetch the questions, but exclude the 'correctAnswer' field so students can't cheat by inspecting network traffic
    const questions = await Question.find({ examId }).select("-correctAnswer");

    res.status(200).json({
      examTitle: exam.title,
      duration: exam.duration,
      questions: questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startExam,
  getExamQuestions
};
