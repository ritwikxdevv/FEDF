const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  violationType: { type: String, enum: ['tab-switch', 'focus-loss', 'fullscreen-exit', 'copy', 'paste', 'right-click'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Violation', violationSchema);
