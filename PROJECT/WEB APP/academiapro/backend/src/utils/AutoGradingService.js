const Question = require("../models/Question");
const Submission = require("../models/Submission");

/**
 * Service to automatically grade Multiple Choice Questions (MCQ) for an exam submission.
 * 
 * @param {string} submissionId - The MongoDB ID of the student's submission record
 * @returns {Promise<Object>} An object containing the computed score and grading status
 */
const autoGradeSubmission = async (submissionId) => {
  try {
    // 1. Fetch the submission document
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const { examId, answers } = submission;
    let finalScore = 0;
    let totalPossibleMarks = 0;

    // 2. Fetch all questions associated with this specific exam
    const questions = await Question.find({ examId: examId });

    // 3. Build a quick O(1) lookup Map for the questions
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
      
      // We only compute 'total possible marks' for MCQs since essays require manual grading
      if (q.questionType === "mcq") {
        totalPossibleMarks += (q.marks || 1);
      }
    });

    // 4. Iterate through the student's submitted answers and compare
    for (const studentAnswer of answers) {
      const questionData = questionMap.get(studentAnswer.questionId.toString());

      // Only auto-grade if the question exists and is specifically marked as an MCQ
      if (questionData && questionData.questionType === "mcq") {
        
        // Normalize strings to prevent grading errors due to accidental whitespace or casing
        const studentProvided = studentAnswer.answer?.toString().trim().toLowerCase();
        const actualCorrect = questionData.correctAnswer?.toString().trim().toLowerCase();

        // If the answer exactly matches, award the marks associated with the question
        if (studentProvided === actualCorrect) {
          finalScore += (questionData.marks || 1);
        }
      }
    }

    // 5. Update the submission record in the database
    submission.score = finalScore;
    
    // Check if the exam contained any essay questions.
    // If it was purely MCQs, we can confidently mark the exam as fully "graded".
    const containsEssays = questions.some(q => q.questionType === "essay");
    if (!containsEssays) {
      submission.status = "graded";
    }

    await submission.save();

    // 6. Return the final metrics
    return {
      success: true,
      submissionId: submission._id,
      score: finalScore,
      totalPossibleMarks: totalPossibleMarks,
      status: submission.status
    };

  } catch (error) {
    throw new Error(`Auto-grading service failed: ${error.message}`);
  }
};

module.exports = {
  autoGradeSubmission
};
