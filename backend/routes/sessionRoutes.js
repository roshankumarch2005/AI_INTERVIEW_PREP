const express = require("express");
const {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
} = require("../controllers/sessionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Session Routes (all protected)
router.post("/", protect, createSession); // Create Session
router.get("/", protect, getAllSessions); // Get All Sessions
router.get("/:id", protect, getSessionById); // Get Session by ID
router.put("/:id", protect, updateSession); // Update Session
router.delete("/:id", protect, deleteSession); // Delete Session

module.exports = router;
