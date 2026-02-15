import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, MapPin, Car, Bike, CheckCircle2 } from 'lucide-react';

const ParkingToken = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const { plate_number, type, slot_number } = data;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 11000,
                    padding: '1rem'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)',
                            border: '1px solid rgba(152, 255, 237, 0.2)',
                            borderRadius: '2rem',
                            padding: '2.5rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(14, 165, 233, 0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative Background Element */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-20%',
                            width: '60%',
                            height: '60%',
                            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
                            zIndex: 0
                        }}></div>

                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'rgba(255, 255, 255, 0.5)',
                                zIndex: 10
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(152, 255, 237, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                border: '1px solid rgba(152, 255, 237, 0.2)'
                            }}>
                                <CheckCircle2 size={40} color="#98FFED" className="mint-glow" />
                            </div>

                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                                Entry <span style={{ color: '#0ea5e9' }}>Confirmed</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                                Your vehicle has been allocated a slot.
                            </p>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <TokenRow
                                    icon={<Ticket size={20} color="#0ea5e9" />}
                                    label="Plate Number"
                                    value={plate_number}
                                />
                                <TokenRow
                                    icon={type === 'Car' ? <Car size={20} color="#0ea5e9" /> : <Bike size={20} color="#0ea5e9" />}
                                    label="Vehicle Type"
                                    value={type}
                                />
                                <TokenRow
                                    icon={<MapPin size={20} color="#98FFED" />}
                                    label="Allocated Slot"
                                    value={slot_number}
                                    highlight
                                />
                            </div>

                            <button
                                onClick={onClose}
                                className="btn-primary"
                                style={{
                                    marginTop: '2.5rem',
                                    width: '100%',
                                    padding: '1.25rem',
                                    borderRadius: '1.5rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    transform: 'translateZ(0)',
                                    background: 'var(--accent-mint)',
                                    color: 'var(--bg-dark)'
                                }}
                            >
                                Print / Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const TokenRow = ({ icon, label, value, highlight }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        gap: '1rem'
    }}>
        <div style={{
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div style={{ textAlign: 'left', flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</p>
            <p style={{
                margin: 0,
                fontSize: highlight ? '1.5rem' : '1.1rem',
                fontWeight: 800,
                color: highlight ? '#98FFED' : '#fff',
                fontFamily: highlight ? 'JetBrains Mono, monospace' : 'inherit'
            }} className={highlight ? 'mint-glow' : ''}>{value}</p>
        </div>
    </div>
);

export default ParkingToken;
