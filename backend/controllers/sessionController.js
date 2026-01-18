const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description } = req.body;

        // Validate input
        if (!role || !experience || !topicsToFocus) {
            return res.status(400).json({
                message: "Please provide role, experience, and topics to focus"
            });
        }

        // Create session
        const session = await Session.create({
            user: req.user._id,
            role,
            experience,
            topicsToFocus,
            description,
        });

        res.status(201).json({
            message: "Session created successfully",
            session,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all sessions for the authenticated user
// @route   GET /api/sessions
// @access  Private
const getAllSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sessions = await Session.find({ user: req.user._id })
            .populate("questions")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Session.countDocuments({ user: req.user._id });

        res.status(200).json({
            sessions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSessions: total,
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).populate("questions");

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if the session belongs to the authenticated user
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this session" });
        }

        res.status(200).json({ session });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description } = req.body;

        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if the session belongs to the authenticated user
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this session" });
        }

        // Update fields
        session.role = role || session.role;
        session.experience = experience || session.experience;
        session.topicsToFocus = topicsToFocus || session.topicsToFocus;
        session.description = description !== undefined ? description : session.description;

        const updatedSession = await session.save();

        res.status(200).json({
            message: "Session updated successfully",
            session: updatedSession,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if the session belongs to the authenticated user
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this session" });
        }

        // Delete all questions associated with this session
        await Question.deleteMany({ session: session._id });

        // Delete the session
        await Session.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Session and associated questions deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
};
