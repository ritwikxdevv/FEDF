const User = require("../models/User");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

const getAnalytics = async (req, res) => {
  try {
    // 1. Total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // 2. Total exams
    const totalExams = await Exam.countDocuments({});

    // Fetch graded submissions to calculate averages
    const submissions = await Submission.find({ score: { $ne: null } }).populate("examId", "totalMarks");

    let totalPercentage = 0;
    let passCount = 0;

    // Filter out invalid records (e.g. if an exam was deleted)
    const validSubmissions = submissions.filter(sub => sub.examId && sub.examId.totalMarks > 0);

    // Calculate score percentage for each submission
    validSubmissions.forEach(sub => {
      const percentage = (sub.score / sub.examId.totalMarks) * 100;
      totalPercentage += percentage;
      
      // Assuming 50% is the passing mark
      if (percentage >= 50) {
        passCount++;
      }
    });

    // 3. Average score
    const averageScore = validSubmissions.length > 0 
      ? (totalPercentage / validSubmissions.length) 
      : 0;

    // 4. Pass percentage
    const passPercentage = validSubmissions.length > 0 
      ? (passCount / validSubmissions.length) * 100 
      : 0;

    res.status(200).json({
      totalStudents,
      totalExams,
      averageScore: parseFloat(averageScore.toFixed(1)),
      passPercentage: parseFloat(passPercentage.toFixed(1))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics
};
