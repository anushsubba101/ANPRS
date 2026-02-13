import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, CheckCircle, Banknote, ShieldCheck, Activity, LogOut, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

const ParkingDashboard = () => {
    const [stats, setStats] = useState({ active_vehicles: 0, available_slots: 50, daily_earnings: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifs, setNotifs] = useState([]);

    const addNotification = (msg, type = 'info') => {
        const id = Date.now();
        setNotifs(prev => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setNotifs(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, activeRes] = await Promise.all([
                fetch(`${API_BASE}/parking/stats`),
                fetch(`${API_BASE}/parking/active`)
            ]);
            const statsData = await statsRes.json();
            const activeData = await activeRes.json();

            if (statsData.success) setStats(statsData.data);
            if (activeData.success) setVehicles(activeData.data);
        } catch (err) {
            console.error("Fetch error:", err);
            addNotification("Failed to sync with server", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Sync every 10s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleManualRelease = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/parking/release/${id}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                addNotification(`Vehicle released. Fee: रू ${data.fee}`, "success");
                fetchData();
            } else {
                addNotification(data.error || "Release failed", "error");
            }
        } catch (err) {
            addNotification("Network error during release", "error");
        }
    };

    return (
        <div className="parking-container" style={{ padding: '2.5rem', minHeight: '100vh', background: 'var(--bg-primary-gradient)' }}>
            {/* Toast Notifications */}
            <div className="notifications-container" style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                    {notifs.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ x: 100, opacity: 0, scale: 0.9 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 100, opacity: 0, scale: 0.9 }}
                            className="glass-card"
                            style={{
                                padding: '1.25rem',
                                minWidth: '300px',
                                borderLeft: `5px solid ${n.type === 'error' ? 'var(--danger)' : 'var(--accent-mint)'}`,
                                background: 'rgba(31, 41, 55, 0.95)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ShieldCheck size={20} color={n.type === 'error' ? '#ef4444' : '#98FFED'} />
                                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: '#fff' }}>{n.msg}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--bg-dark)', marginBottom: '1.5rem', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                    Parking <span className="mint-glow" style={{ color: '#0ea5e9' }}>Management</span>
                </h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <StatCard
                        icon={<Activity size={24} color="#98FFED" />}
                        label="Active Vehicles"
                        value={stats.active_vehicles}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<CheckCircle size={24} color="#98FFED" />}
                        label="Available Slots"
                        value={stats.available_slots}
                        highlight
                        delay={0.2}
                    />
                    <StatCard
                        icon={<Banknote size={24} color="#98FFED" />}
                        label="Daily Earnings"
                        value={`रू ${stats.daily_earnings.toLocaleString()}`}
                        delay={0.3}
                    />
                </div>
            </header>

            <div className="table-wrapper">
                <ActiveVehiclesTable
                    vehicles={vehicles}
                    onRelease={handleManualRelease}
                    loading={loading}
                />
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, highlight, delay }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="glass-card"
        style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
    >
        <div style={{ background: 'rgba(152, 255, 237, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(152, 255, 237, 0.2)' }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: highlight ? 'var(--accent-mint)' : '#fff' }} className={highlight ? 'mint-glow' : ''}>{value}</h2>
        </div>
    </motion.div>
);

const ActiveVehiclesTable = ({ vehicles, onRelease, loading }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (entryTimeStr) => {
        const entryTime = new Date(entryTimeStr);
        const seconds = Math.floor((now - entryTime) / 1000);
        if (seconds < 0) return "00:00:00";
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '2.5rem', overflow: 'hidden' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Live Traffic</h3>
                {loading && <Loader2 className="animate-spin" color="#98FFED" />}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', color: '#fff' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '0 1rem 1rem' }}>Plate Number</th>
                            <th style={{ padding: '0 1rem 1rem' }}>Vehicle Type</th>
                            <th style={{ padding: '0 1rem 1rem' }}>Entry Time</th>
                            <th style={{ padding: '0 1rem 1rem' }}>Live Duration</th>
                            <th style={{ padding: '0 1rem 1rem', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    No active vehicles in the lot.
                                </td>
                            </tr>
                        ) : (
                            vehicles.map(v => (
                                <motion.tr
                                    key={v._id}
                                    layout
                                    whileHover={{ scale: 1.005, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                                    style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', transition: 'background 0.2s' }}
                                >
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-mint)' }}>{v.plate_number}</td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <span style={{ background: 'rgba(152, 255, 237, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', border: '1px solid rgba(152, 255, 237, 0.2)' }}>
                                            {v.vehicle_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>
                                        {new Date(v.entry_time).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                                        {formatDuration(v.entry_time)}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => onRelease(v._id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--danger)',
                                                color: 'var(--danger)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            className="release-btn"
                                        >
                                            <LogOut size={16} />
                                            Release
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ParkingDashboard;
