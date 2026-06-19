const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"]
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"]
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },
        answer: {
          type: String,
          required: true
        }
      }
    ],
    score: {
      type: Number,
      default: null
    },
    submittedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ["in-progress", "submitted", "graded", "completed"],
      default: "in-progress"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ examId: 1 });
submissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
