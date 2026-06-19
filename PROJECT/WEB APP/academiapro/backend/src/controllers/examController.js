const Exam = require("../models/Exam");
const User = require("../models/User");
const Question = require("../models/Question");

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private (Teacher/Admin)
const createExam = async (req, res) => {
  try {
    const { 
      title, 
      subject, 
      description, 
      duration, 
      totalMarks, 
      startDate, 
      endDate, 
      questions, 
      assignedTo, 
      isAssignedToAll 
    } = req.body;

    const exam = await Exam.create({
      title,
      subject,
      description,
      duration,
      totalMarks,
      startDate,
      endDate,
      assignedTo: assignedTo || [],
      isAssignedToAll: isAssignedToAll || false,
      createdBy: req.user._id
    });

    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionDocs = questions.map(q => ({
        examId: exam._id,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        questionType: q.questionType || "mcq"
      }));

      const createdQuestions = await Question.insertMany(questionDocs);
      exam.questions = createdQuestions.map(q => q._id);
      await exam.save();
    }

    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = {
        $or: [
          { isAssignedToAll: true },
          { assignedTo: req.user._id }
        ]
      };
    }
    
    // Find exams based on filter and populate the creator's name and email
    const exams = await Exam.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher/Admin)
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, description, duration, totalMarks, startDate, endDate, questions, assignedTo, isAssignedToAll } = req.body;

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Security check: Only allow the original creator (or an admin) to update the exam
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this exam" });
    }

    if (title) exam.title = title;
    if (subject) exam.subject = subject;
    if (description) exam.description = description;
    if (duration) exam.duration = duration;
    if (totalMarks) exam.totalMarks = totalMarks;
    if (startDate) exam.startDate = startDate;
    if (endDate) exam.endDate = endDate;
    if (assignedTo !== undefined) exam.assignedTo = assignedTo;
    if (isAssignedToAll !== undefined) exam.isAssignedToAll = isAssignedToAll;

    if (questions && Array.isArray(questions)) {
      // Delete old questions associated with this exam
      await Question.deleteMany({ examId: exam._id });

      // Insert new questions
      const questionDocs = questions.map(q => ({
        examId: exam._id,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        questionType: q.questionType || "mcq"
      }));

      const createdQuestions = await Question.insertMany(questionDocs);
      exam.questions = createdQuestions.map(q => q._id);
    }

    const updatedExam = await exam.save();
    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher/Admin)
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Security check: Only allow the original creator (or an admin) to delete the exam
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this exam" });
    }

    await Question.deleteMany({ examId: exam._id });
    await exam.deleteOne();

    res.status(200).json({ message: "Exam deleted successfully", id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign an exam to students
// @route   POST /api/exams/:id/assign
// @access  Private (Admin)
const assignExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds, assignToAll } = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (assignToAll) {
      exam.isAssignedToAll = true;
      exam.assignedTo = [];
    } else if (Array.isArray(studentIds) && studentIds.length > 0) {
      exam.isAssignedToAll = false;
      exam.assignedTo = studentIds;
    } else {
      return res.status(400).json({ message: "Provide studentIds array or set assignToAll to true." });
    }

    await exam.save();
    res.status(200).json({ message: "Exam assigned successfully", exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  assignExam
};
