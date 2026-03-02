import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { currentUser, userRole } = useAuth();

    // 1. If no user is logged in, redirect them immediately to the /login page
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 2. If allowedRoles is provided, check if the current user has one of the roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // If they are an admin trying to access a student page
        if (userRole === 'admin') {
            return <Navigate to="/admin/chaos" replace />;
        }
        // If they are a student trying to access an admin page
        return <Navigate to="/" replace />;
    }

    // Otherwise, render the child routes natively
    return <Outlet />;
};
