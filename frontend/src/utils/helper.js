// Format date to readable string
export const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Format date with time
export const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Handle API errors
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        return error.response.data.message || "An error occurred";
    } else if (error.request) {
        // Request made but no response
        return "No response from server. Please check your connection.";
    } else {
        // Something else happened
        return error.message || "An unexpected error occurred";
    }
};

// Experience levels
export const EXPERIENCE_LEVELS = [
    "Intern (0-1 years)",
    "Junior (1-3 years)",
    "Mid-level (3-5 years)",
    "Senior (5-8 years)",
    "Lead (8+ years)",
];

// Common job roles
export const JOB_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Product Manager",
    "UI/UX Designer",
    "QA Engineer",
];
