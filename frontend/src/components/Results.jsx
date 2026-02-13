import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Camera, FileText } from 'lucide-react';

function Results({ data }) {
    if (!data || !data.results) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could show a toast here
    };

    const getConfidenceClass = (conf) => {
        if (conf >= 0.8) return 'confidence-high';
        if (conf >= 0.5) return 'confidence-medium';
        return 'confidence-low';
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="results-section"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="results-header" style={{ marginBottom: '2rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Analysis Results</h2>
                <div className="meta-info" style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><FileText size={14} style={{ marginRight: 6 }} /> {data.meta?.filename}</span>
                    <span>⏱ {data.meta?.duration_seconds}s</span>
                </div>
            </div>

            {data.results.length === 0 ? (
                <div className="empty-state">
                    <p>No license plates were detected in this image.</p>
                </div>
            ) : (
                <div className="results-grid">
                    {data.results.map((plate, index) => (
                        <motion.div key={index} className="plate-card" variants={item}>
                            <div className="plate-header">
                                <div className="plate-title">
                                    <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>#{index + 1}</span>
                                    <span>License Plate</span>
                                </div>
                                <span className={`confidence-badge ${getConfidenceClass(plate.confidence)}`}>
                                    {Math.round(plate.confidence * 100)}% Confidence
                                </span>
                            </div>

                            <div className="images-container">
                                <div className="image-box">
                                    <span className="image-label">Original</span>
                                    {plate.original_plate ? (
                                        <img className="plate-thumb" src={plate.original_plate} alt="Original" />
                                    ) : (
                                        <div className="fallback-thumb"><Camera size={16} /></div>
                                    )}
                                </div>
                                <div className="image-box">
                                    <span className="image-label">Deskewed</span>
                                    {plate.deskewed_plate ? (
                                        <img className="plate-thumb" src={plate.original_plate} alt="Original" />
                                    ) : (
                                        <div className="fallback-thumb"><Camera size={16} /></div>
                                    )}
                                </div>
                                <div className="image-box">
                                    <span className="image-label">Digital</span>
                                    {plate.digital_plate ? (
                                        <img className="plate-thumb" src={plate.original_plate} alt="Original" />
                                    ) : (
                                        <div className="fallback-thumb"><Camera size={16} /></div>
                                    )}
                                </div>
                            </div>

                            <div className="text-result">
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>DETECTED TEXT</label>
                                    <div className="detected-text">{plate.final_text || "---"}</div>
                                </div>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(plate.final_text)}
                                    title="Copy to clipboard"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default Results;
