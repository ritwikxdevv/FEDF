const Violation = require('../models/Violation');

// Record a new violation (student only)
exports.createViolation = async (req, res) => {
  try {
    const { examId } = req.params;
    const { violationType } = req.body;
    if (!violationType) {
      return res.status(400).json({ message: 'Violation type required.' });
    }
    const violation = await Violation.create({
      studentId: req.user._id,
      examId,
      violationType,
    });
    res.status(201).json({ message: 'Violation recorded.', violation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: list all violations
exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find()
      .populate('studentId', 'name email')
      .populate('examId', 'title')
      .sort({ createdAt: -1 });
    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
