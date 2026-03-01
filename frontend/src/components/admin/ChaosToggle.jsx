import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/axios.client';

export default function ChaosToggle() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStatuses = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/chaos');
            setServices(res.data);
        } catch (err) {
            console.error('Failed to load chaos statuses', err);
        } finally {
            setLoading(false);
        }
    };

    const toggle = async (service, enabled) => {
        try {
            await apiClient.post(`/admin/chaos/${service}`, { enabled });
            fetchStatuses();
        } catch (err) {
            console.error('Failed to toggle service', err);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Chaos Toggles</h2>
            {loading && <p>Loading…</p>}
            {!loading && services.length === 0 && <p>No services configured.</p>}
            <div className="space-y-2">
                {services.map((s) => (
                    <div key={s.service} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span
                                className={`w-3 h-3 rounded-full ${s.enabled ? 'bg-green-500' : 'bg-red-500'}`}
                                title={s.enabled ? 'enabled' : 'disabled'}
                            />
                            <span className="font-mono">{s.service}</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={s.enabled}
                            onChange={(e) => toggle(s.service, e.target.checked)}
                            className="toggle-checkbox"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}