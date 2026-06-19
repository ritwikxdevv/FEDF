const Submission = require("../models/Submission");

// @desc    Get personal exam results for the logged-in student
// @route   GET /api/results/my-results
// @access  Private (Student)
const getMyResults = async (req, res) => {
  try {
    // Security Check: Only students should access personal result histories
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view personal results." });
    }

    // Fetch submissions belonging to this student that are no longer "in-progress"
    // Populate the linked exam data to provide rich context (title, course code, total marks)
    const results = await Submission.find({ 
      studentId: req.user._id,
      status: { $in: ["submitted", "graded", "completed"] } 
    })
    .populate("examId", "title subject courseCode totalMarks duration startDate")
    .select("-answers") // Exclude the raw answers array to keep the payload clean and fast
    .sort({ submittedAt: -1 }); // Sort by newest first

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all student results across the entire platform
// @route   GET /api/results/all
// @access  Private (Admin)
const getAllResults = async (req, res) => {
  try {
    // Security Check: Strictly limit this endpoint to administrators or teachers
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators are authorized to view all platform results." });
    }

    // Support optional filtering by a specific exam via query params (e.g., ?examId=123)
    const { examId } = req.query;
    let query = { status: { $in: ["submitted", "graded", "completed"] } };
    
    if (examId) {
      query.examId = examId;
    }

    // Fetch the submissions and deeply populate both the Exam and Student details
    const results = await Submission.find(query)
      .populate("examId", "title subject courseCode totalMarks startDate")
      .populate("studentId", "name email")
      .select("-answers") // Keep payload lightweight
      .sort({ submittedAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyResults,
  getAllResults
};
