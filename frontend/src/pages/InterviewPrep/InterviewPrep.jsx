import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  SESSION_ENDPOINTS,
  QUESTION_ENDPOINTS,
  AI_ENDPOINTS,
} from "../../utils/apiPaths";
import {
  handleApiError,
  EXPERIENCE_LEVELS,
  JOB_ROLES,
  formatDateTime,
} from "../../utils/helper";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
  FiZap,
  FiStar,
  FiRefreshCw,
} from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";

const InterviewPrep = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session");

  // Session state
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: "",
  });

  // Question state
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    answer: "",
    note: "",
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessionIdFromUrl && sessions.length > 0) {
      const session = sessions.find((s) => s._id === sessionIdFromUrl);
      if (session) {
        selectSession(session);
      }
    }
  }, [sessionIdFromUrl, sessions]);

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get(SESSION_ENDPOINTS.GET_ALL);
      setSessions(response.data.sessions || []);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session) => {
    setCurrentSession(session);
    setSearchParams({ session: session._id });
    await fetchQuestions(session._id);
  };

  const fetchQuestions = async (sessionId) => {
    try {
      const response = await axiosInstance.get(
        QUESTION_ENDPOINTS.GET_BY_SESSION(sessionId)
      );
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.role || !sessionForm.experience || !sessionForm.topicsToFocus) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSessionLoading(true);
    try {
      const response = await axiosInstance.post(SESSION_ENDPOINTS.CREATE, sessionForm);
      const newSession = response.data.session;
      setSessions([newSession, ...sessions]);
      setShowSessionForm(false);
      setSessionForm({ role: "", experience: "", topicsToFocus: "", description: "" });
      toast.success("Session created successfully!");
      selectSession(newSession);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setSessionLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await axiosInstance.delete(SESSION_ENDPOINTS.DELETE(sessionId));
      setSessions(sessions.filter((s) => s._id !== sessionId));
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setQuestions([]);
        setSearchParams({});
      }
      toast.success("Session deleted successfully!");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question) {
      toast.error("Please enter a question");
      return;
    }

    setQuestionLoading(true);
    try {
      const response = await axiosInstance.post(QUESTION_ENDPOINTS.CREATE, {
        sessionId: currentSession._id,
        ...questionForm,
      });
      setQuestions([response.data.question, ...questions]);
      setShowQuestionForm(false);
      setQuestionForm({ question: "", answer: "", note: "" });
      toast.success("Question added successfully!");
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId) => {
    if (!editingQuestion.question) {
      toast.error("Question cannot be empty");
      return;
    }

    try {
      const response = await axiosInstance.put(
        QUESTION_ENDPOINTS.UPDATE(questionId),
        editingQuestion
      );
      setQuestions(
        questions.map((q) => (q._id === questionId ? response.data.question : q))
      );
      setEditingQuestion(null);
      toast.success("Question updated successfully!");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await axiosInstance.delete(QUESTION_ENDPOINTS.DELETE(questionId));
      setQuestions(questions.filter((q) => q._id !== questionId));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleTogglePin = async (questionId) => {
    try {
      const response = await axiosInstance.patch(
        QUESTION_ENDPOINTS.TOGGLE_PIN(questionId)
      );
      setQuestions(
        questions.map((q) => (q._id === questionId ? response.data.question : q))
      );
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleGenerateQuestions = async () => {
    if (!currentSession) return;

    setAiLoading(true);
    try {
      const response = await axiosInstance.post(AI_ENDPOINTS.GENERATE_QUESTIONS, {
        sessionId: currentSession._id,
      });
      setQuestions([...response.data.questions, ...questions]);
      toast.success(`Generated ${response.data.count} questions!`);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetAnswer = async (questionId) => {
    setAnswerLoading(questionId);
    try {
      const response = await axiosInstance.post(AI_ENDPOINTS.GET_ANSWER, {
        questionId,
      });
      setQuestions(
        questions.map((q) => (q._id === questionId ? response.data.question : q))
      );
      toast.success("AI answer generated!");
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setAnswerLoading(null);
    }
  };

  if (loading) {
    return <Loading text="Loading interview prep..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar - Sessions List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Sessions</h2>
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <FiPlus />
                </button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => selectSession(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${currentSession?._id === session._id
                        ? "bg-orange-50 border-2 border-orange-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                          {session.role}
                        </h3>
                        <p className="text-xs text-gray-600">{session.experience}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.questions?.length || 0} questions
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session._id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentSession ? (
              <div>
                {/* Session Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentSession.role}
                  </h1>
                  <p className="text-gray-600 mb-1">
                    Experience: {currentSession.experience}
                  </p>
                  <p className="text-gray-600 mb-3">
                    Topics: {currentSession.topicsToFocus}
                  </p>
                  {currentSession.description && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {currentSession.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <FiPlus /> Add Question
                    </button>
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <ImSpinner8 className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiZap /> Generate AI Questions
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                      <p className="text-gray-600 mb-4">No questions yet</p>
                      <button
                        onClick={() => setShowQuestionForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg"
                      >
                        <FiPlus /> Add Your First Question
                      </button>
                    </div>
                  ) : (
                    questions.map((question) => (
                      <div
                        key={question._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                      >
                        {editingQuestion?._id === question._id ? (
                          // Edit Mode
                          <div>
                            <textarea
                              value={editingQuestion.question}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  question: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-200 rounded-lg mb-3"
                              rows="3"
                            />
                            <textarea
                              value={editingQuestion.answer}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  answer: e.target.value,
                                })
                              }
                              placeholder="Answer..."
                              className="w-full p-3 border border-gray-200 rounded-lg mb-3"
                              rows="4"
                            />
                            <textarea
                              value={editingQuestion.note}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  note: e.target.value,
                                })
                              }
                              placeholder="Personal notes..."
                              className="w-full p-3 border border-gray-200 rounded-lg mb-3"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateQuestion(question._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <FiSave /> Save
                              </button>
                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                              >
                                <FiX /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                {question.question}
                              </h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleTogglePin(question._id)}
                                  className={`p-2 rounded-lg ${question.isPinned
                                      ? "text-yellow-500 bg-yellow-50"
                                      : "text-gray-400 hover:text-yellow-500"
                                    }`}
                                >
                                  <FiStar />
                                </button>
                                <button
                                  onClick={() => setEditingQuestion(question)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>

                            {question.answer && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                                <p className="text-sm font-semibold text-green-900 mb-2">
                                  Answer:
                                </p>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {question.answer}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}

                            {!question.answer && (
                              <button
                                onClick={() => handleGetAnswer(question._id)}
                                disabled={answerLoading === question._id}
                                className="mb-3 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                              >
                                {answerLoading === question._id ? (
                                  <>
                                    <ImSpinner8 className="animate-spin" />
                                    Generating Answer...
                                  </>
                                ) : (
                                  <>
                                    <FiZap /> Get AI Answer
                                  </>
                                )}
                              </button>
                            )}

                            {question.note && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                  Notes:
                                </p>
                                <p className="text-sm text-gray-700">{question.note}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-3">
                              {formatDateTime(question.createdAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Select or Create a Session
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose a session from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg"
                >
                  <FiPlus /> Create New Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Form Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Session</h2>
            <form onSubmit={handleCreateSession}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Role *
                  </label>
                  <select
                    value={sessionForm.role}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, role: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    required
                  >
                    <option value="">Select a role</option>
                    {JOB_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={sessionForm.experience}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, experience: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    required
                  >
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics to Focus *
                  </label>
                  <input
                    type="text"
                    value={sessionForm.topicsToFocus}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, topicsToFocus: e.target.value })
                    }
                    placeholder="e.g., React, Node.js, System Design"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={sessionForm.description}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, description: e.target.value })
                    }
                    placeholder="Add any additional notes..."
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={sessionLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {sessionLoading ? "Creating..." : "Create Session"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSessionForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Question</h2>
            <form onSubmit={handleCreateQuestion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question: e.target.value })
                    }
                    placeholder="Enter your interview question..."
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer (Optional)
                  </label>
                  <textarea
                    value={questionForm.answer}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, answer: e.target.value })
                    }
                    placeholder="Add your answer..."
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Notes (Optional)
                  </label>
                  <textarea
                    value={questionForm.note}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, note: e.target.value })
                    }
                    placeholder="Add personal notes..."
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {questionLoading ? "Adding..." : "Add Question"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;