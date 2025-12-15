import React, { useState } from 'react';
import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { motion } from 'framer-motion';
import VideoUploader from '../components/VideoUploader';
import TrackingDashboard from '../components/TrackingDashboard';
import { fadeInUp } from '../utils/animations';

const DashboardPage = () => {
    const [currentVideo, setCurrentVideo] = useState(null);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            <Box sx={{ minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                    {/* Breadcrumbs */}
                    <Breadcrumbs sx={{ mb: 3 }}>
                        <MuiLink
                            component={Link}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'text.secondary',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            <HomeIcon fontSize="small" />
                            Home
                        </MuiLink>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                            <DashboardIcon fontSize="small" />
                            Dashboard
                        </Box>
                    </Breadcrumbs>

                    {!currentVideo ? (
                        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 8 }}>
                            <Box sx={{ textAlign: 'center', mb: 6 }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Analyze Traffic Flow
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Upload CCTV footage to detect vehicles and identify wrong-way violations in real-time
                                </Typography>
                            </Box>
                            <VideoUploader onUploadComplete={setCurrentVideo} />
                        </Box>
                    ) : (
                        <TrackingDashboard
                            filename={currentVideo}
                            onBack={() => setCurrentVideo(null)}
                        />
                    )}
                </Container>
            </Box>
        </motion.div>
    );
};

export default DashboardPage;
