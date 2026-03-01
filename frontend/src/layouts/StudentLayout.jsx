import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function StudentLayout() {
    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
