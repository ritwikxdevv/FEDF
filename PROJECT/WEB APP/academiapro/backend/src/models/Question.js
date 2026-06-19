const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"]
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true
    },
    options: [
      {
        type: String,
        trim: true
      }
    ],
    correctAnswer: {
      type: String,
      trim: true
    },
    marks: {
      type: Number,
      required: [true, "Marks for this question are required"],
      min: [1, "Marks must be at least 1"]
    },
    questionType: {
      type: String,
      enum: {
        values: ["mcq", "true-false", "essay", "short-answer"],
        message: "{VALUE} is not a valid question type"
      },
      required: [true, "Question type is required"],
      default: "mcq"
    }
  },
  {
    timestamps: true
  }
);

// Add an index to efficiently query all questions belonging to a single exam
questionSchema.index({ examId: 1 });

module.exports = mongoose.model("Question", questionSchema);
