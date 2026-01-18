import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { SESSION_ENDPOINTS } from "../../utils/apiPaths";
import { handleApiError, formatDate } from "../../utils/helper";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { FiPlus, FiFolder, FiClock, FiArrowRight } from "react-icons/fi";

const Dashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalQuestions: 0,
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await axiosInstance.get(SESSION_ENDPOINTS.GET_ALL);
            const fetchedSessions = response.data.sessions || [];
            setSessions(fetchedSessions);

            // Calculate stats
            const totalQuestions = fetchedSessions.reduce(
                (sum, session) => sum + (session.questions?.length || 0),
                0
            );
            setStats({
                totalSessions: fetchedSessions.length,
                totalQuestions,
            });
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Loading your dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">Track your interview preparation progress</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Sessions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSessions}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FiFolder className="text-orange-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Questions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalQuestions}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiClock className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-sm text-white">
                        <p className="text-orange-100 text-sm">Quick Action</p>
                        <button
                            onClick={() => navigate("/interview-prep")}
                            className="mt-2 flex items-center gap-2 text-lg font-semibold hover:gap-3 transition-all"
                        >
                            Create New Session <FiPlus />
                        </button>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Interview Sessions</h2>
                        <button
                            onClick={() => navigate("/interview-prep")}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            <FiPlus /> New Session
                        </button>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <FiFolder className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No sessions yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first interview preparation session to get started
                            </p>
                            <button
                                onClick={() => navigate("/interview-prep")}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                <FiPlus /> Create Session
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.map((session) => (
                                <div
                                    key={session._id}
                                    onClick={() => navigate(`/interview-prep?session=${session._id}`)}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-2">{session.role}</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Experience: {session.experience}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Topics: {session.topicsToFocus}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            {session.questions?.length || 0} questions
                                        </span>
                                        <span className="text-gray-500">{formatDate(session.createdAt)}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-orange-600 font-medium">
                                        View Session <FiArrowRight />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
