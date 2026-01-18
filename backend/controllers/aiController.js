const { GoogleGenAI } = require("@google/genai");
const Session = require("../models/Session");
const Question = require("../models/Question");
const { generateQuestionsPrompt, generateAnswerPrompt } = require("../utils/prompts");

// Initialize Google Generative AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate interview questions using AI
// @route   POST /api/ai/generate-questions
// @access  Private
const generateQuestions = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "Please provide sessionId" });
        }

        // Check if session exists and belongs to user
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to generate questions for this session" });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables."
            });
        }

        // Generate prompt
        const prompt = generateQuestionsPrompt(
            session.role,
            session.experience,
            session.topicsToFocus
        );

        // Call Google Generative AI
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });
        const text = result.text;

        // Parse the JSON response
        let questions;
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                questions = JSON.parse(text);
            }
        } catch (parseError) {
            return res.status(500).json({
                message: "Failed to parse AI response",
                error: parseError.message
            });
        }

        // Create questions in database
        const createdQuestions = [];
        for (const q of questions) {
            const newQuestion = await Question.create({
                session: sessionId,
                question: q.question,
                answer: "",
                note: "",
            });
            createdQuestions.push(newQuestion);
            session.questions.push(newQuestion._id);
        }

        await session.save();

        res.status(201).json({
            message: "Questions generated successfully",
            questions: createdQuestions,
            count: createdQuestions.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get AI-generated answer for a question
// @route   POST /api/ai/get-answer
// @access  Private
const getAnswer = async (req, res) => {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(400).json({ message: "Please provide questionId" });
        }

        // Find question and populate session
        const question = await Question.findById(questionId).populate("session");
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if the session belongs to the authenticated user
        if (question.session.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this question" });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "AI service not configured. Please add GEMINI_API_KEY to environment variables."
            });
        }

        // Generate prompt
        const prompt = generateAnswerPrompt(
            question.question,
            question.session.role,
            question.session.experience
        );

        // Call Google Generative AI
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });
        const answer = result.text;

        // Update question with the generated answer
        question.answer = answer;
        await question.save();

        res.status(200).json({
            message: "Answer generated successfully",
            answer,
            question,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    generateQuestions,
    getAnswer,
};
