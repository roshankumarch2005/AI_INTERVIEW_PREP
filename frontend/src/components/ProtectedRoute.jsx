import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import Loading from "./Loading";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useUser();

    if (loading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
