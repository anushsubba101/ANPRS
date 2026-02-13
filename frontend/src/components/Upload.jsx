import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Upload({ onUploadSuccess, onError }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        // Simple client-side validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-matroska'];
        if (!validTypes.some(type => selectedFile.type.includes(type.split('/')[1]) || (selectedFile.type === '' && selectedFile.name.match(/\.(mkv|avi)$/i)))) {
            // Allow basic check, backend does strict check
        }

        setFile(selectedFile);

        // Create preview
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type.startsWith('video/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearFile = (e) => {
        e.stopPropagation(); // Prevent triggering click on dropzone
        setFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/anpr`, {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                throw new Error(responseData.error?.message || 'Processing failed');
            }

            onUploadSuccess(responseData.data);
            // Don't clear preview immediately so ui doesn't jump, let parent handle view switch if needed
        } catch (err) {
            console.error(err);
            onError(err.message || "Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-section-container">
            <motion.div
                className={`upload-card ${dragActive ? 'drag-active' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {/* Inner Border Container for Dashed Look */}
                <div className="inner-border">
                    <input
                        ref={inputRef}
                        type="file"
                        onChange={handleChange}
                        accept="image/*,video/*"
                        className="hidden-input"
                        style={{ display: 'none' }}
                    />

                    {!file ? (
                        <div className="drop-zone">
                            <div className="icon-wrapper">
                                <UploadCloud size={40} />
                            </div>
                            <div className="upload-text">
                                <h3>Upload Media</h3>
                                <p>Drag & drop or click to browse</p>
                                <p className="formats-hint" style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>JPG, PNG, MP4, AVI</p>
                            </div>
                        </div>
                    ) : (
                        <div className="file-preview">
                            <div className="preview-container">
                                {file.type.startsWith('video/') ? (
                                    <div className="video-placeholder" style={{ padding: '2rem', color: 'white' }}>
                                        <Film size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
                                        <p>{file.name}</p>
                                    </div>
                                ) : (
                                    <img src={preview} alt="Preview" className="preview-media" />
                                )}
                                <button className="remove-btn" onClick={clearFile} title="Remove file">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="file-name-label" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ffffff' }}>{file.name}</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Actions - Outside the card */}
            <div className="action-bar">
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: 20, height: 20, border: '2px solid #ffffff)', borderTopColor: '#ffffff' }}></div>
                            Analyzing...
                        </>
                    ) : (
                        'Run Analysis'
                    )}
                </button>
            </div>

            {loading && (
                <motion.div className="loading-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p style={{ color: '#ffffff' }}>Processing with AI Models...</p>
                </motion.div>
            )}
        </div>
    );
}

export default Upload;
