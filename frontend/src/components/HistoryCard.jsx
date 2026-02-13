import React from 'react';
import { Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function HistoryCard({ item, onDelete }) {
    const { _id, filename, detected_text, confidence, timestamp } = item;

    // Determine confidence color based on threshold
    const getConfidenceColor = (conf) => {
        const perc = conf * 100;
        if (perc > 85) return 'high';
        if (perc >= 60) return 'medium';
        return 'low';
    };

    const confType = getConfidenceColor(confidence);

    return (
        <motion.div
            className="history-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            layout
        >
            <div className="glass-shine"></div>

            <div className="card-header">
                <div className="file-info">
                    <div className="icon-box">
                        <FileText size={14} />
                    </div>
                    <span className="filename">{filename}</span>
                </div>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(_id)}
                    title="Remove from history"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="card-body">
                <div className="plate-display">
                    <span className="label">Detected Plate</span>
                    <h4 className="plate-text">{detected_text}</h4>
                </div>

                <div className={`confidence-pill ${confType}`}>
                    <CheckCircle size={14} />
                    <span>{(confidence * 100).toFixed(1)}% Confidence</span>
                </div>
            </div>

            <div className="card-footer">
                <div className="timestamp">
                    <Calendar size={14} />
                    <span>{timestamp}</span>
                </div>
            </div>

            <style jsx>{`
                .history-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .glass-shine {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%);
                    pointer-events: none;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #94a3b8;
                    font-size: 0.8rem;
                }

                .icon-box {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 6px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .filename {
                    max-width: 140px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-weight: 500;
                }

                .delete-btn {
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.1);
                    color: rgba(239, 68, 68, 0.6);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 10px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .delete-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.15);
                    border-color: rgba(239, 68, 68, 0.2);
                    transform: rotate(5deg);
                }

                .card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    z-index: 1;
                }

                .plate-display {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748b;
                    font-weight: 700;
                }

                .plate-text {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: #f8fafc;
                    letter-spacing: 1px;
                    margin: 0;
                    font-family: 'JetBrains Mono', 'Courier New', monospace;
                    text-shadow: 0 0 20px rgba(255,255,255,0.1);
                }

                .confidence-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    width: fit-content;
                    border: 1px solid transparent;
                }

                .confidence-pill.high {
                    background: rgba(34, 197, 94, 0.1);
                    color: #4ade80;
                    border-color: rgba(34, 197, 94, 0.2);
                }

                .confidence-pill.medium {
                    background: rgba(234, 179, 8, 0.1);
                    color: #facc15;
                    border-color: rgba(234, 179, 8, 0.2);
                }

                .confidence-pill.low {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .card-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    z-index: 1;
                }

                .timestamp {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
            `}</style>
        </motion.div>
    );
}

export default HistoryCard;
