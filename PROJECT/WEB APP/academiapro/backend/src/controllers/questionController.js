const Question = require("../models/Question");
const Exam = require("../models/Exam");

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (Teacher/Admin)
const createQuestion = async (req, res) => {
  try {
    const { examId, questionText, options, correctAnswer, marks, questionType } = req.body;

    // Verify the parent exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Associated exam not found" });
    }

    // Security check: Only the teacher who created the exam (or an admin) can add questions
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to add questions to this exam" });
    }

    const question = await Question.create({
      examId,
      questionText,
      options,
      correctAnswer,
      marks,
      questionType
    });

    // Automatically push the newly created question ID into the Exam's questions array
    exam.questions.push(question._id);
    await exam.save();

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all questions for a specific exam
// @route   GET /api/questions/exam/:examId
// @access  Private
const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Fetch all questions mapped to this exam ID
    const questions = await Question.find({ examId });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Teacher/Admin)
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Security check: Ensure the user modifying the question owns the parent exam
    const exam = await Exam.findById(question.examId);
    if (exam && exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this question" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Enforce schema rules during update
    );

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Teacher/Admin)
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Security check: Ensure the user deleting the question owns the parent exam
    const exam = await Exam.findById(question.examId);
    if (exam && exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this question" });
    }

    await question.deleteOne();

    // Clean up: Remove the deleted question's reference from the Exam's questions array
    if (exam) {
      exam.questions = exam.questions.filter(
        (qId) => qId.toString() !== id.toString()
      );
      await exam.save();
    }

    res.status(200).json({ message: "Question deleted successfully", id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion
};
