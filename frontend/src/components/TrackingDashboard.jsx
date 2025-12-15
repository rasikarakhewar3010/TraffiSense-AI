import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Chip,
    CircularProgress,
    Paper,
    IconButton,
    Tooltip,
    Container,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {
    ArrowUpward,
    ArrowDownward,
    ArrowBack as ArrowLeft,
    ArrowForward as ArrowRight,
    SmartToy,
    Warning,
    Upload,
    Speed,
    DirectionsCar,
    Refresh,
    CheckCircle,
    PlayArrow,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const TrackingDashboard = ({ filename, onBack }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [stats, setStats] = useState({ total: 0, wrongWay: 0 });
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [direction, setDirection] = useState('auto');
    const [isFinished, setIsFinished] = useState(false);
    const [progress, setProgress] = useState(0);
    const [reportData, setReportData] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [activeViolationId, setActiveViolationId] = useState(null);
    const fullVideoRef = useRef(null);

    const handleSeekToViolation = (timestamp) => {
        if (!fullVideoRef.current) return;

        fullVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ensure timestamp is a valid number
        let targetTime = Number(timestamp);
        if (isNaN(targetTime)) targetTime = 0;

        // Add 2 seconds pre-roll for context, clamped to 0
        const seekTime = Math.max(0, targetTime - 2.0);

        console.log(`Seeking Video to: ${seekTime}s (Event Time: ${targetTime}s)`);

        fullVideoRef.current.currentTime = seekTime;

        const playPromise = fullVideoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.error("Video playback interrupted:", err);
            });
        }
    };

    const wsRef = useRef(null);
    const hasReceivedData = useRef(false);

    const checkBackendHealth = async () => {
        try {
            const response = await fetch('/health');
            return response.ok;
        } catch (e) {
            return false;
        }
    };

    const connectWebSocket = () => {
        if (wsRef.current) {
            try {
                wsRef.current.close();
            } catch (e) {
                // Ignore close errors
            }
        }

        // Use direct backend URL to avoid proxy issues during dev
        // In production this should use window.location.host
        const wsUrl = `ws://127.0.0.1:8000/ws/${filename}?direction=${direction}`;
        console.log(`Connecting to WebSocket: ${wsUrl} (Attempt ${retryCount + 1})`);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setIsReconnecting(false);
            setRetryCount(0); // Reset retries on successful connection
            setError(null);
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.error) {
                    if (!hasReceivedData.current) {
                        setError(data.error);
                    }
                    ws.close();
                    return;
                }

                if (!hasReceivedData.current && (data.image || data.objects)) {
                    hasReceivedData.current = true;
                    setIsLoading(false);
                }

                if (data.image) {
                    setImageSrc(`data:image/jpeg;base64,${data.image}`);
                }

                if (data.objects) {
                    const wrongWayCount = data.objects.filter(obj => obj.is_wrong_way).length;
                    setStats({
                        total: data.objects.length,
                        wrongWay: wrongWayCount
                    });

                    // Alert System
                    const newViolations = data.objects.filter(obj => obj.is_new_violation);
                    if (newViolations.length > 0) {
                        setError(`VIOLATION DETECTED! Vehicle ID: ${newViolations[0].id}`);
                        setTimeout(() => setError(null), 3000);
                    }
                }

                if (data.current_frame && data.total_frames) {
                    const percentage = (data.current_frame / data.total_frames) * 100;
                    setProgress(percentage);
                }

                if (data.type === 'status') {
                    setStatusMessage(data.message);
                }

                if (data.type === 'report') {
                    console.log("Report received!", data.summary);
                    setReportData(data.summary);
                    // FORCE FINISH: Ensure we transition even if onclose is delayed
                    setIsFinished(true);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("Error parsing WebSocket message:", e);
            }
        };

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            console.log(`Disconnected. Code: ${event.code}, Reason: ${event.reason}`);

            if (hasReceivedData.current) {
                // If we received data, we assume the stream finished naturally
                // (Server closes connection when done)
                setIsFinished(true);
                setIsLoading(false);
            } else {
                // Reconnection Logic
                // Only reconnect if we haven't finished and don't have a report
                if (!isFinished && !reportData) {
                    const maxRetries = 5;

                    if (retryCount < maxRetries) {
                        setIsReconnecting(true);
                        const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff: 1s, 2s, 4s... max 10s

                        console.log(`Reconnecting in ${timeout}ms...`);
                        setTimeout(() => {
                            if (!isFinished) { // Check again before connecting
                                setRetryCount(prev => prev + 1);
                            }
                        }, timeout);
                    } else {
                        setIsReconnecting(false);
                        if (!error) {
                            setError("Connection to server failed. Please ensure the backend is running.");
                        }
                        setIsLoading(false);
                    }
                }
            }
        };
    };

    // Trigger connection when retryCount changes
    useEffect(() => {
        if (retryCount > 0 && !isConnected && !isFinished) {
            connectWebSocket();
        }
    }, [retryCount]);

    useEffect(() => {
        // Initial setup
        setIsLoading(true);
        setError(null);
        setIsFinished(false);
        hasReceivedData.current = false;
        setImageSrc(null);
        setStats({ total: 0, wrongWay: 0 });
        setProgress(0);
        setReportData(null);
        setRetryCount(0);
        setIsReconnecting(false);

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [filename, direction]);

    const handleDownloadReport = () => {
        if (!reportData) return;

        const csvContent = [
            ["Traffic Analysis Report"],
            [`Filename: ${filename}`],
            [`Date: ${new Date().toLocaleString()}`],
            [`Video URL: ${reportData.cloud_video_url || 'Local File Only'}`],
            [],
            ["Summary Statistics"],
            ["Total Vehicles", reportData.total],
            ["Average Speed (km/h)", reportData.average_speed || 0],
            ["Violations", reportData.violations],
            [],
            ["Traffic Composition"],
            ...Object.entries(reportData.class_breakdown || {}).map(([k, v]) => [k, v]),
            [],
            ["Violation Details"],
            ["Vehicle ID", "Start Time (s)", "End Time (s)", "Start Frame", "End Frame"],
            ...reportData.violation_list.map(v => [
                v.id,
                v.start_time?.toFixed(2) || v.timestamp?.toFixed(2) || '',
                v.end_time?.toFixed(2) || '',
                v.start_frame || '',
                v.start_frame || '',
                v.end_frame || ''
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `traffic_report_${filename}_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <Box sx={{ width: '100%', minHeight: '80vh' }}>
            {/* Video Player Dialog */}
            <Dialog
                open={!!playingVideo}
                onClose={() => setPlayingVideo(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#0f172a',
                        color: '#fff',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Violation Evidence</Typography>
                    <IconButton onClick={() => setPlayingVideo(null)} sx={{ color: '#94a3b8' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {playingVideo && (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
                            <video
                                controls
                                autoPlay
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                src={`/violations/${playingVideo}`}
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 0.5,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Live Traffic Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 8,
                            height: 8,
                            bgcolor: isConnected ? '#10b981' : (isFinished ? '#3b82f6' : '#ef4444'),
                            boxShadow: isConnected ? '0 0 10px #10b981' : (isFinished ? '0 0 10px #3b82f6' : '0 0 10px #ef4444')
                        }} />
                        {isConnected && <Box sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: '#f59e0b', boxShadow: '0 0 8px #f59e0b',
                            ml: -0.5, animation: 'pulse 1s infinite'
                        }} title="Turbo Mode Active" />}
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {filename}
                        </Typography>
                        {isFinished && (
                            <Chip
                                label="COMPLETED"
                                size="small"
                                color="primary"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                            />
                        )}
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Refresh />}
                    onClick={onBack}
                    sx={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        backdropFilter: 'blur(4px)',
                        boxShadow: 'none',
                        '&:hover': {
                            background: 'rgba(239, 68, 68, 0.2)',
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                        },
                    }}
                >
                    Reset Session
                </Button>
            </Box>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5'
                            }}
                            icon={<Warning sx={{ color: '#ef4444' }} />}
                        >
                            {error}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Grid container spacing={3}>
                {!isFinished ? (
                    <>
                        {/* Video Display */}
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Card
                                sx={{
                                    backgroundColor: '#000',
                                    aspectRatio: '16/9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: 4,
                                    boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 40px -10px rgba(0,0,0,0.5)',
                                }}
                            >
                                {/* Scanning Grid Overlay Effect */}
                                <Box sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }} />

                                {/* Video Progress Line */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '4px',
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #60a5fa 0%, #c084fc 100%)', // Blue/Purple gradient
                                    zIndex: 30,
                                    transition: 'width 0.1s linear',
                                    boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                                }} />

                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt="Processed Stream"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            zIndex: 0,
                                            opacity: isFinished ? 0.4 : 1, // Dim image when finished
                                            transition: 'opacity 0.5s ease'
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ textAlign: 'center', color: 'text.secondary', zIndex: 2 }}>
                                        {isLoading ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <CircularProgress size={60} thickness={2} sx={{ color: '#3b82f6' }} />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <SmartToy sx={{ fontSize: 24, color: '#60a5fa', opacity: 0.8 }} />
                                                    </Box>
                                                </Box>
                                                <Typography variant="body1" sx={{ color: '#94a3b8', letterSpacing: '0.05em' }}>
                                                    {statusMessage || "INITIALIZING AI MODEL..."}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            !isConnected && !error && !isFinished && (
                                                <Typography variant="body1">Waiting for video stream...</Typography>
                                            )
                                        )}
                                    </Box>
                                )}

                                {!isConnected && !isLoading && !error && !isFinished && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                            backdropFilter: 'blur(8px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10
                                        }}
                                    >
                                        <Chip
                                            label={isReconnecting ? `RECONNECTING (${retryCount})...` : "CONNECTION LOST"}
                                            color={isReconnecting ? "warning" : "error"}
                                            icon={<Warning />}
                                            sx={{
                                                fontWeight: 700,
                                                px: 2,
                                                py: 3,
                                                borderRadius: 2,
                                                letterSpacing: '0.1em'
                                            }}
                                        />
                                    </Box>
                                )}
                            </Card>
                        </Grid>

                        {/* Stats and Controls */}
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Stats Grid */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Card sx={{
                                                height: '100%',
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
                                                borderColor: 'rgba(59, 130, 246, 0.2)'
                                            }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#60a5fa' }}>
                                                        <DirectionsCar fontSize="small" />
                                                        <Typography variant="caption" fontWeight={600} letterSpacing="0.05em">
                                                            DETECTED
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff' }}>
                                                        {stats.total}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                        >
                                            <Card sx={{
                                                height: '100%',
                                                background: stats.wrongWay > 0
                                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 41, 59, 0.4) 100%)'
                                                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                                                borderColor: stats.wrongWay > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                                                boxShadow: stats.wrongWay > 0 ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'none'
                                            }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: stats.wrongWay > 0 ? '#f87171' : '#94a3b8' }}>
                                                        <Warning fontSize="small" />
                                                        <Typography variant="caption" fontWeight={600} letterSpacing="0.05em">
                                                            WRONG WAY
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h3" sx={{ fontWeight: 700, color: stats.wrongWay > 0 ? '#ef4444' : '#fff' }}>
                                                        {stats.wrongWay}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                </Grid>

                                {/* Legend / Flow Status */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Paper sx={{
                                                p: 2,
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: 3,
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1
                                            }}>
                                                <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                                                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 700 }}>
                                                    NORMAL FLOW
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Paper sx={{
                                                p: 2,
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: 3,
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1
                                            }}>
                                                <Warning sx={{ color: '#ef4444', fontSize: 20 }} />
                                                <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                                    WRONG WAY
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </motion.div>

                                {/* Direction Controls */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <Card sx={{
                                        borderRadius: 4,
                                        background: 'rgba(30, 41, 59, 0.4)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                                <Speed sx={{ color: '#60a5fa' }} />
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Flow Direction
                                                </Typography>
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant={direction === 'auto' ? 'contained' : 'outlined'}
                                                startIcon={<SmartToy />}
                                                onClick={() => setDirection('auto')}
                                                sx={{
                                                    mb: 3,
                                                    borderRadius: 2,
                                                    py: 1.5,
                                                    background: direction === 'auto' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                                                    borderColor: 'rgba(59, 130, 246, 0.3)'
                                                }}
                                            >
                                                Auto AI Detection
                                            </Button>

                                            <Grid container spacing={1.5}>
                                                <Grid size={{ xs: 12 }} />
                                                <Grid size={{ xs: 4 }} />
                                                <Grid size={{ xs: 4 }}>
                                                    <IconButton
                                                        onClick={() => setDirection('270')}
                                                        sx={{
                                                            width: '100%',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: direction === '270' ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                                                            bgcolor: direction === '270' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                            color: direction === '270' ? '#3b82f6' : '#94a3b8',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                                                        }}
                                                    >
                                                        <ArrowUpward />
                                                    </IconButton>
                                                </Grid>
                                                <Grid size={{ xs: 4 }} />

                                                <Grid size={{ xs: 4 }}>
                                                    <IconButton
                                                        onClick={() => setDirection('180')}
                                                        sx={{
                                                            width: '100%',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: direction === '180' ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                                                            bgcolor: direction === '180' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                            color: direction === '180' ? '#3b82f6' : '#94a3b8',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                                                        }}
                                                    >
                                                        <ArrowLeft />
                                                    </IconButton>
                                                </Grid>
                                                <Grid size={{ xs: 4 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600, fontFamily: 'monospace' }}>
                                                            {direction === 'auto' ? 'AUTO' : `${direction}°`}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 4 }}>
                                                    <IconButton
                                                        onClick={() => setDirection('0')}
                                                        sx={{
                                                            width: '100%',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: direction === '0' ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                                                            bgcolor: direction === '0' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                            color: direction === '0' ? '#3b82f6' : '#94a3b8',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                                                        }}
                                                    >
                                                        <ArrowRight />
                                                    </IconButton>
                                                </Grid>

                                                <Grid size={{ xs: 4 }} />
                                                <Grid size={{ xs: 4 }}>
                                                    <IconButton
                                                        onClick={() => setDirection('90')}
                                                        sx={{
                                                            width: '100%',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: direction === '90' ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                                                            bgcolor: direction === '90' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                            color: direction === '90' ? '#3b82f6' : '#94a3b8',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                                                        }}
                                                    >
                                                        <ArrowDownward />
                                                    </IconButton>
                                                </Grid>
                                                <Grid size={{ xs: 4 }} />
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Box>
                        </Grid>
                    </>
                ) : (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 0 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 4,
                                    border: '1px solid rgba(148, 163, 184, 0.1)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                    <CheckCircle sx={{ color: '#10b981', fontSize: 32 }} />
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                                        Analysis Complete
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleDownloadReport}
                                        startIcon={<Upload sx={{ transform: 'rotate(180deg)' }} />}
                                    >
                                        Export Report
                                    </Button>
                                </Box>

                                {/* Full Session Video Player */}
                                {(reportData?.cloud_video_url || reportData?.full_video) && (
                                    <Box sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                        <video
                                            ref={fullVideoRef}
                                            controls
                                            style={{ width: '100%', display: 'block' }}
                                            src={reportData.cloud_video_url || `/processed/${reportData.full_video}`}
                                            onError={(e) => {
                                                console.error("Video load error:", e);
                                                // Fallback to local if cloud fails (though local might also fail if codec bad)
                                                if (reportData.cloud_video_url && e.target.src === reportData.cloud_video_url) {
                                                    if (reportData.full_video) {
                                                        console.log("Falling back to local video...");
                                                        e.target.src = `/processed/${reportData.full_video}`;
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}

                                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>Violation Log</Typography>
                                <Box sx={{
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    pr: 1,
                                    '&::-webkit-scrollbar': { width: 6 },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
                                }}>
                                    {reportData && reportData.violation_list && reportData.violation_list.length > 0 ? (
                                        reportData.violation_list.map((v, i) => (
                                            <Box key={i} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                mb: 1,
                                                bgcolor: activeViolationId === v.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.05)',
                                                borderRadius: 2,
                                                borderLeft: activeViolationId === v.id ? '3px solid #3b82f6' : '3px solid #ef4444',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ color: activeViolationId === v.id ? '#fff' : '#fca5a5' }}>
                                                            ID: <strong>{v.id}</strong>
                                                        </Typography>
                                                        {v.type && (
                                                            <Chip
                                                                label={v.type}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.7rem',
                                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                        Time: {v.start_time?.toFixed(2)}s
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PlayArrow />}
                                                    onClick={() => {
                                                        setActiveViolationId(v.id);
                                                        handleSeekToViolation(v.start_time);
                                                    }}
                                                    sx={{
                                                        borderColor: activeViolationId === v.id ? 'transparent' : 'rgba(239, 68, 68, 0.3)',
                                                        color: activeViolationId === v.id ? '#fff' : '#f87171',
                                                        bgcolor: activeViolationId === v.id ? '#3b82f6' : 'transparent',
                                                        '&:hover': {
                                                            borderColor: activeViolationId === v.id ? 'transparent' : '#ef4444',
                                                            bgcolor: activeViolationId === v.id ? '#2563eb' : 'rgba(239, 68, 68, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    {activeViolationId === v.id ? 'Playing' : 'View'}
                                                </Button>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                                            No violations detected.
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={onBack}
                                        startIcon={<Refresh />}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                                            fontWeight: 700
                                        }}
                                    >
                                        Start New Analysis
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box >
    );
};

export default TrackingDashboard;
