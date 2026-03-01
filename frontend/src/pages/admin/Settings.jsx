import React from 'react';
import ChaosToggle from '../../components/admin/ChaosToggle';

export default function Settings() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
            <ChaosToggle />
        </div>
    );
}