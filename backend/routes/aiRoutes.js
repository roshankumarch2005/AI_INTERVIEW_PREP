const express = require("express");
const { generateQuestions, getAnswer } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// AI Routes (all protected)
router.post("/generate-questions", protect, generateQuestions); // Generate Questions
router.post("/get-answer", protect, getAnswer); // Get Answer

module.exports = router;
