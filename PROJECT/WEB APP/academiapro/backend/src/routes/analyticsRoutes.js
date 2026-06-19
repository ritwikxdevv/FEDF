const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

// Route    GET /api/analytics
// Desc     Get platform-wide analytics
// Access   Private (Admin only)
router.get("/", protect, authorize("admin"), getAnalytics);

module.exports = router;
