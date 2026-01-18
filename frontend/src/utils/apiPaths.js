// API Base URL
export const BASE_URL = "http://localhost:8000/api";

// Auth Endpoints
export const AUTH_ENDPOINTS = {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    PROFILE: `${BASE_URL}/auth/profile`,
    UPDATE_PROFILE: `${BASE_URL}/auth/profile`,
    UPLOAD_IMAGE: `${BASE_URL}/auth/upload-profile-image`,
};

// Session Endpoints
export const SESSION_ENDPOINTS = {
    CREATE: `${BASE_URL}/sessions`,
    GET_ALL: `${BASE_URL}/sessions`,
    GET_BY_ID: (id) => `${BASE_URL}/sessions/${id}`,
    UPDATE: (id) => `${BASE_URL}/sessions/${id}`,
    DELETE: (id) => `${BASE_URL}/sessions/${id}`,
};

// Question Endpoints
export const QUESTION_ENDPOINTS = {
    CREATE: `${BASE_URL}/questions`,
    GET_BY_SESSION: (sessionId) => `${BASE_URL}/questions/session/${sessionId}`,
    UPDATE: (id) => `${BASE_URL}/questions/${id}`,
    DELETE: (id) => `${BASE_URL}/questions/${id}`,
    TOGGLE_PIN: (id) => `${BASE_URL}/questions/${id}/pin`,
};

// AI Endpoints
export const AI_ENDPOINTS = {
    GENERATE_QUESTIONS: `${BASE_URL}/ai/generate-questions`,
    GET_ANSWER: `${BASE_URL}/ai/get-answer`,
};
