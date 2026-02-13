import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Database } from 'lucide-react';
import HistoryCard from './HistoryCard';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-header">
            <div className="skeleton-icon"></div>
            <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-body">
            <div className="skeleton-line label"></div>
            <div className="skeleton-line text"></div>
            <div className="skeleton-badge"></div>
        </div>
        <div className="skeleton-footer">
            <div className="skeleton-line footer"></div>
        </div>
    </div>
);

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/history`);
            const data = await response.json();

            if (data.success) {
                setHistory(data.data);
            } else {
                throw new Error(data.error?.message || 'Failed to fetch history');
            }
        } catch (err) {
            console.error('History fetch error:', err);
            setError(err.message || 'Could not connect to server.');
        } finally {
            // Artificial delay for smooth skeleton transition
            setTimeout(() => setLoading(false), 800);
        }
    };

    const handleDelete = async (id) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/history/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setHistory(prev => prev.filter(item => item._id !== id));
            } else {
                alert(data.error?.message || 'Failed to delete item');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting item');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <div className="title-group">
                    <div className="icon-badge">
                        <Database size={24} />
                    </div>
                    <div className="text-content">
                        <h2>Prediction History</h2>
                        <p>View and manage all previous vehicle plate detections.</p>
                    </div>
                </div>
                <button
                    className="refresh-btn"
                    onClick={fetchHistory}
                    disabled={loading}
                    title="Refresh history"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {error ? (
                <div className="error-state glass-panel">
                    <AlertCircle size={48} color="#ef4444" />
                    <h3>Database Connection Failed</h3>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchHistory}>Try Again</button>
                </div>
            ) : loading ? (
                <div className="history-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : history.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Database size={64} className="empty-icon" />
                    <h3>No Records Found</h3>
                    <p>Start scanning plates to build your detection history.</p>
                </div>
            ) : (
                <motion.div
                    className="history-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {history.map((item) => (
                            <HistoryCard
                                key={item._id}
                                item={item}
                                onDelete={handleDelete}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <style jsx>{`
                .history-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 1.5rem;
                }

                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .icon-badge {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 12px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                }

                .text-content h2 {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #f8fafc;
                    letter-spacing: -0.5px;
                }

                .text-content p {
                    margin: 0.25rem 0 0;
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .refresh-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 0.6rem 1.25rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .refresh-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .history-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                }

                .glass-panel {
                    background: rgba(30, 41, 59, 0.2);
                    backdrop-filter: blur(10px);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 4rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }

                .glass-panel h3 {
                    margin: 1.5rem 0 0.5rem;
                    font-size: 1.5rem;
                    color: #f1f5f9;
                }

                .glass-panel p {
                    color: #64748b;
                    max-width: 300px;
                    margin: 0;
                }

                .empty-icon {
                    color: rgba(59, 130, 246, 0.2);
                }

                /* Skeletons */
                .skeleton-card {
                    background: rgba(15, 23, 42, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .skeleton-line {
                    background: linear-gradient(90deg, 
                        rgba(255,255,255,0.02) 25%, 
                        rgba(255,255,255,0.05) 50%, 
                        rgba(255,255,255,0.02) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                    border-radius: 4px;
                }

                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }

                .skeleton-header { display: flex; align-items: center; gap: 0.75rem; }
                .skeleton-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.03); }
                .skeleton-line.short { width: 40%; height: 12px; }
                .skeleton-body { display: flex; flex-direction: column; gap: 0.75rem; }
                .skeleton-line.label { width: 30%; height: 8px; }
                .skeleton-line.text { width: 80%; height: 32px; border-radius: 8px; }
                .skeleton-badge { width: 100px; height: 24px; border-radius: 100px; background: rgba(255,255,255,0.03); }
                .skeleton-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }
                .skeleton-line.footer { width: 50%; height: 10px; }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .btn-retry {
                    margin-top: 1.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-retry:hover {
                    background: #2563eb;
                    transform: scale(1.05);
                }

                @media (max-width: 768px) {
                    .history-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .refresh-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default History;
