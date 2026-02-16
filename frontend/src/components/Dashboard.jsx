import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    History as HistoryIcon,
    Settings,
    HelpCircle,
    Lock,
    Unlock,
    Activity,
    Clock,
    MapPin,
    AlertCircle
} from 'lucide-react';
import Upload from './Upload';
import Results from './Results';
import ParkingToken from './ParkingToken';

const Dashboard = ({ gateStatus, setGateStatus, tokenHistory, setTokenHistory, tokenData, setTokenData, parkingStats }) => {
    const [resultsData, setResultsData] = useState(null);
    const [error, setError] = useState(null);

    // Gate Revert Logic (removed from here, handled in App.jsx now)

    const handleUploadSuccess = (response) => {
        // Set resultsData from nested data object for Results component
        setResultsData(response.data);
        setError(null);

        // Standardize token data from flattened response keys or token object
        const normalizedToken = response.token || (response.plate ? {
            plate_number: response.plate,
            slot_number: response.slot,
            type: response.parking?.type || 'unknown'
        } : null);

        // Handle Parking Logic from API Response
        if (response.gate_status === 'OPEN') {
            setGateStatus('OPEN');
        }

        if (normalizedToken) {
            setTokenData(normalizedToken);

            // Add to History Sidebar
            setTokenHistory(prev => [
                {
                    id: Date.now(),
                    ...normalizedToken,
                    timestamp: new Date().toLocaleTimeString(),
                    status: 'Active'
                },
                ...prev
            ]);
        }

        if (response.parking && response.parking.event === 'exit') {
            const exitPlate = response.plate || response.parking.plate;
            setTokenHistory(prev => prev.map(entry =>
                entry.plate_number === exitPlate ? { ...entry, status: 'Exited' } : entry
            ));
        }
    };

    const handleError = (msg) => {
        setError(msg);
        setResultsData(null);
    };

    return (
        <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg-dark)', color: '#fff', overflow: 'hidden' }}>
            {/* History Sidebar */}
            <aside className="history-sidebar" style={{
                width: '320px',
                background: 'rgba(17, 24, 39, 0.9)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0ea5e9' }}>
                        <HistoryIcon size={24} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Live History</h2>
                    </div>
                </div>

                <div className="sidebar-list" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <AnimatePresence>
                        {tokenHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.2)' }}>
                                <Clock size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.9rem' }}>Waiting for scans...</p>
                            </div>
                        ) : (
                            tokenHistory.map((entry) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        background: entry.status === 'Expired' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '1.25rem',
                                        padding: '1.25rem',
                                        marginBottom: '1rem',
                                        border: entry.status === 'Expired' ? '1px solid rgba(255, 255, 255, 0.02)' : '1px solid rgba(152, 255, 237, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        opacity: entry.status === 'Expired' ? 0.6 : 1
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        background: entry.status === 'Active' ? 'var(--accent-mint)' : 'rgba(255,255,255,0.1)'
                                    }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 800,
                                            color: entry.status === 'Expired' ? 'rgba(255,255,255,0.4)' : 'var(--accent-mint)',
                                            letterSpacing: '0.05em',
                                            textDecoration: entry.status === 'Expired' ? 'line-through' : 'none'
                                        }}>{entry.plate_number}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{entry.timestamp}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                        <MapPin size={14} color="#0ea5e9" opacity={0.7} />
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Slot {entry.slot_number}</span>
                                        {entry.status === 'Expired' ? (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: '1rem', color: 'rgba(255,255,255,0.3)' }}>EXPIRED</span>
                                        ) : (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(152, 255, 237, 0.1)', padding: '0.1rem 0.6rem', borderRadius: '1rem', color: '#98FFED', fontWeight: 700 }}>ACTIVE</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 70%)' }}>

                {/* Central Status Hub (Finalized Layout) */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'linear-gradient(to bottom, var(--bg-dark) 60%, transparent)'
                }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {/* Gate Status Indicator */}
                        <motion.div
                            initial={false}
                            animate={{
                                scale: gateStatus === 'OPEN' ? [1, 1.02, 1] : 1,
                                borderColor: gateStatus === 'OPEN' ? '#22c55e' : '#ef4444',
                                boxShadow: gateStatus === 'OPEN' ? '0 0 40px rgba(34, 197, 94, 0.2)' : '0 0 20px rgba(239, 68, 68, 0.05)'
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem',
                                padding: '1rem 3rem',
                                borderRadius: '4rem',
                                background: gateStatus === 'OPEN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                border: '2px solid',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            {gateStatus === 'OPEN' ? (
                                <Unlock size={24} color="#22c55e" strokeWidth={3} />
                            ) : (
                                <Lock size={24} color="#ef4444" strokeWidth={3} />
                            )}
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: 900,
                                letterSpacing: '0.15em',
                                color: gateStatus === 'OPEN' ? '#22c55e' : '#ef4444',
                            }}>
                                GATE: {gateStatus}
                            </span>
                        </motion.div>

                    </div>
                </div>

                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 2rem 4rem' }}>
                    {/* Scanner Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <Upload onUploadSuccess={handleUploadSuccess} onError={handleError} />
                    </div>

                    {/* High-Visibility Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '2rem',
                                    color: '#f87171'
                                }}
                            >
                                <AlertCircle size={32} />
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 800 }}>Scan Error</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Section */}
                    <Results data={resultsData} />
                </div>

                {/* Central Token Popup (Automatic Trigger) */}
                {tokenData && (
                    <ParkingToken
                        isOpen={!!tokenData}
                        onClose={() => setTokenData(null)}
                        data={tokenData}
                    />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
