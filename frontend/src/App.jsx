import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';

// Pages
import Login from './pages/shared/Login';
import MenuDashboard from './pages/student/MenuDashboard';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes Wrapper */}
                    <Route element={<ProtectedRoute />}>

                        {/* Student Flow */}
                        <Route element={<StudentLayout />}>
                            <Route path="/" element={<MenuDashboard />} />
                            {/* Track Order page will go here */}
                        </Route>

                        {/* Admin Flow will go here */}
                    </Route>

                </Routes>
            </Router>
        </AuthProvider>
    );
}
