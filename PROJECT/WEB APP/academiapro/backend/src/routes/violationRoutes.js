const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Violation = require('../models/Violation');

const router = express.Router();

// Record a new violation (student only)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { examId, violationType } = req.body;
    if (!examId || !violationType) {
      return res.status(400).json({ message: 'examId and violationType are required.' });
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
});

// Admin: list all violations (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const violations = await Violation.find()
      .populate('studentId', 'name email')
      .populate('examId', 'title')
      .sort({ createdAt: -1 });
    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
