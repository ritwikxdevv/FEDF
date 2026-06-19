const Submission = require("../models/Submission");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

// @desc    Submit exam answers
// @route   POST /api/submissions/:examId
// @access  Private (Student protected)
const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // Expects an array of { questionId, answer } objects

    // Security Verification: Ensure the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only registered students can submit exam answers." });
    }

    // Verify the exam actually exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Authorization: Ensure student is assigned to this exam
    const isAssigned =
      exam.isAssignedToAll ||
      exam.assignedTo.some(id => id.toString() === req.user._id.toString());
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this exam." });
    }

    // Find the student's existing submission record
    let submission = await Submission.findOne({
      studentId: req.user._id,
      examId: examId
    });

    // Block the submission if the student has already submitted or been graded
    if (submission && submission.status !== "in-progress") {
      return res.status(400).json({ message: "This exam has already been successfully submitted." });
    }

    // Handle edge case: if a submission document doesn't exist yet, instantiate one.
    if (!submission) {
      submission = new Submission({
        studentId: req.user._id,
        examId: examId,
        status: "in-progress"
      });
    }

    // Core Logic: Store answers in the Submission collection
    submission.answers = answers;
    
    // Automatically grade student submissions by comparing student answers to correct answers
    const questions = await Question.find({ examId });
    let calculatedScore = 0;
    
    if (questions && questions.length > 0) {
      questions.forEach(q => {
        const studentAns = answers.find(a => a.questionId.toString() === q._id.toString());
        if (studentAns) {
          const isCorrect = String(studentAns.answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
          if (isCorrect) {
            calculatedScore += q.marks || 1;
          }
        }
      });
    }

    submission.score = calculatedScore;

    // Core Logic: Mark status as 'completed' and save the exact submission timestamp
    submission.status = "completed";
    submission.submittedAt = Date.now();

    // Save to MongoDB
    await submission.save();

    res.status(200).json({
      message: "Exam answers submitted successfully.",
      submission: submission
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitExam
};
