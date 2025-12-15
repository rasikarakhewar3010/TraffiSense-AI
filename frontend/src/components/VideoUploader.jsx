import React, { useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
} from '@mui/material';
import { CloudUpload, VideoFile, AutoAwesome } from '@mui/icons-material';
import { motion } from 'framer-motion';

const VideoUploader = ({ onUploadComplete }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            onUploadComplete(data.filename);
        } catch (error) {
            console.error('Error uploading file:', error);
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                alert('Cannot connect to the backend server. Please ensure the Python API is running.');
            } else {
                alert(`Upload failed: ${error.message}`);
            }
        } finally {
            setUploading(false);
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
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                sx={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: dragActive ? '2px dashed #3b82f6' : '2px dashed rgba(148, 163, 184, 0.2)',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        borderColor: uploading ? 'rgba(148, 163, 184, 0.2)' : '#60a5fa',
                        transform: uploading ? 'none' : 'translateY(-4px)',
                        boxShadow: uploading ? 'none' : '0 20px 40px rgba(59, 130, 246, 0.1)',
                    },
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Background Glow Effect */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <CardContent sx={{ p: 8, position: 'relative', zIndex: 1 }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                        id="video-upload"
                        disabled={uploading}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '32px',
                            width: '100%'
                        }}
                    >
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: uploading
                                    ? 'rgba(148, 163, 184, 0.1)'
                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: uploading ? 'none' : '0 0 40px rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            {uploading ? (
                                <CircularProgress size={50} thickness={4} sx={{ color: '#60a5fa' }} />
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <CloudUpload sx={{ fontSize: 60, color: '#60a5fa' }} />
                                    </motion.div>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: -10,
                                        right: -10,
                                        bgcolor: '#1e293b',
                                        borderRadius: '50%',
                                        p: 1,
                                        border: '1px solid rgba(148, 163, 184, 0.2)'
                                    }}>
                                        <AutoAwesome sx={{ fontSize: 20, color: '#a855f7' }} />
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, color: '#fff' }}>
                                {uploading ? 'Analyzing Footage...' : 'Upload Traffic Footage'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 1 }}>
                                Drag & drop your video file here, or click to browse
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                                <Typography variant="caption" sx={{
                                    px: 1.5, py: 0.5,
                                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                                    borderRadius: 1,
                                    color: '#64748b',
                                    fontFamily: 'monospace'
                                }}>
                                    MP4
                                </Typography>
                                <Typography variant="caption" sx={{
                                    px: 1.5, py: 0.5,
                                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                                    borderRadius: 1,
                                    color: '#64748b',
                                    fontFamily: 'monospace'
                                }}>
                                    AVI
                                </Typography>
                                <Typography variant="caption" sx={{
                                    px: 1.5, py: 0.5,
                                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                                    borderRadius: 1,
                                    color: '#64748b',
                                    fontFamily: 'monospace'
                                }}>
                                    MOV
                                </Typography>
                            </Box>
                        </Box>

                        {!uploading && (
                            <Button
                                variant="contained"
                                startIcon={<VideoFile />}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent bubbling
                                    fileInputRef.current?.click();
                                }}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 50,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 15px 30px rgba(37, 99, 235, 0.3)',
                                    }
                                }}
                            >
                                Select Video File
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default VideoUploader;
