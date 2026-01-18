const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
    try {
        const { sessionId, question, answer, note } = req.body;

        // Validate input
        if (!sessionId || !question) {
            return res.status(400).json({
                message: "Please provide sessionId and question"
            });
        }

        // Check if session exists and belongs to user
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to add questions to this session" });
        }

        // Create question
        const newQuestion = await Question.create({
            session: sessionId,
            question,
            answer: answer || "",
            note: note || "",
        });

        // Add question to session's questions array
        session.questions.push(newQuestion._id);
        await session.save();

        res.status(201).json({
            message: "Question created successfully",
            question: newQuestion,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all questions for a session
// @route   GET /api/questions/session/:sessionId
// @access  Private
const getQuestionsBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Check if session exists and belongs to user
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this session" });
        }

        const questions = await Question.find({ session: sessionId }).sort({ createdAt: -1 });

        res.status(200).json({
            questions,
            total: questions.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
    try {
        const { question, answer, note } = req.body;

        const existingQuestion = await Question.findById(req.params.id).populate("session");

        if (!existingQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if the session belongs to the authenticated user
        if (existingQuestion.session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this question" });
        }

        // Update fields
        existingQuestion.question = question || existingQuestion.question;
        existingQuestion.answer = answer !== undefined ? answer : existingQuestion.answer;
        existingQuestion.note = note !== undefined ? note : existingQuestion.note;

        const updatedQuestion = await existingQuestion.save();

        res.status(200).json({
            message: "Question updated successfully",
            question: updatedQuestion,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate("session");

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if the session belongs to the authenticated user
        if (question.session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this question" });
        }

        // Remove question from session's questions array
        await Session.findByIdAndUpdate(
            question.session._id,
            { $pull: { questions: question._id } }
        );

        // Delete the question
        await Question.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Toggle pin status of a question
// @route   PATCH /api/questions/:id/pin
// @access  Private
const togglePinQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate("session");

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if the session belongs to the authenticated user
        if (question.session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to modify this question" });
        }

        // Toggle pin status
        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({
            message: `Question ${question.isPinned ? "pinned" : "unpinned"} successfully`,
            question,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createQuestion,
    getQuestionsBySession,
    updateQuestion,
    deleteQuestion,
    togglePinQuestion,
};
