const express = require("express");
const {
    createQuestion,
    getQuestionsBySession,
    updateQuestion,
    deleteQuestion,
    togglePinQuestion,
} = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Question Routes (all protected)
router.post("/", protect, createQuestion); // Create Question
router.get("/session/:sessionId", protect, getQuestionsBySession); // Get Questions by Session
router.put("/:id", protect, updateQuestion); // Update Question
router.delete("/:id", protect, deleteQuestion); // Delete Question
router.patch("/:id/pin", protect, togglePinQuestion); // Toggle Pin Status

module.exports = router;
