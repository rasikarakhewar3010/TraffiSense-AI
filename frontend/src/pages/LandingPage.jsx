import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import {
    Speed,
    Security,
    Analytics,
    CloudUpload,
    Notifications,
    Timeline,
    ArrowForward,
    PlayCircleOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem } from '../utils/animations';

const LandingPage = () => {
    const features = [
        {
            icon: <Speed sx={{ fontSize: 40 }} />,
            title: 'Real-Time Detection',
            description: 'Instant analysis of traffic footage with millisecond-level precision using advanced AI algorithms.',
            color: '#3b82f6',
        },
        {
            icon: <Security sx={{ fontSize: 40 }} />,
            title: 'Wrong-Way Alerts',
            description: 'Automatically detect and flag vehicles traveling in the wrong direction to prevent accidents.',
            color: '#a855f7',
        },
        {
            icon: <Analytics sx={{ fontSize: 40 }} />,
            title: 'AI-Powered Analytics',
            description: 'Leverage YOLOv8 deep learning model for accurate vehicle tracking and behavior analysis.',
            color: '#10b981',
        },
        {
            icon: <CloudUpload sx={{ fontSize: 40 }} />,
            title: 'Easy Upload',
            description: 'Simple drag-and-drop interface for uploading CCTV footage and getting instant results.',
            color: '#f59e0b',
        },
        {
            icon: <Notifications sx={{ fontSize: 40 }} />,
            title: 'Smart Notifications',
            description: 'Receive immediate alerts when violations are detected with detailed incident reports.',
            color: '#ef4444',
        },
        {
            icon: <Timeline sx={{ fontSize: 40 }} />,
            title: 'Traffic Insights',
            description: 'Comprehensive dashboards showing traffic patterns, violation trends, and analytics.',
            color: '#06b6d4',
        },
    ];

    const stats = [
        { value: '99.5%', label: 'Detection Accuracy' },
        { value: '<100ms', label: 'Processing Time' },
        { value: '24/7', label: 'Monitoring' },
        { value: '1000+', label: 'Vehicles Tracked' },
    ];

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    py: { xs: 8, md: 16 },
                }}
            >
                {/* Animated Background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                        animation: 'pulse 8s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 0.5 },
                            '50%': { opacity: 1 },
                        },
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                            >
                                <motion.div variants={staggerItem}>
                                    <Chip
                                        label="AI-Powered Traffic Monitoring"
                                        sx={{
                                            mb: 3,
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            color: 'primary.main',
                                            fontWeight: 600,
                                        }}
                                    />
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                            fontWeight: 800,
                                            mb: 3,
                                            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        Intelligent Traffic
                                        <br />
                                        <span
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            Violation Detection
                                        </span>
                                    </Typography>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 4,
                                            color: 'text.secondary',
                                            fontWeight: 400,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Harness the power of YOLOv8 AI to detect wrong-way driving and monitor
                                        traffic flow in real-time. Keep roads safer with cutting-edge computer vision.
                                    </Typography>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                                            component={Link}
                                            to="/dashboard"
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowForward />}
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            Try Dashboard
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/about"
                                            variant="outlined"
                                            size="large"
                                            startIcon={<PlayCircleOutline />}
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                                },
                                            }}
                                        >
                                            Learn More
                                        </Button>
                                    </Box>
                                </motion.div>
                            </motion.div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '120%',
                                            height: '120%',
                                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                                            animation: 'rotate 20s linear infinite',
                                            '@keyframes rotate': {
                                                '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                                                '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
                                            },
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                                            borderRadius: 4,
                                            p: 4,
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop"
                                            alt="Traffic monitoring"
                                            sx={{
                                                width: '100%',
                                                borderRadius: 2,
                                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    {stats.map((stat, index) => (
                        <Grid size={{ xs: 6, md: 3 }} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            mb: 1,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features Section */}
            <Box id="features" sx={{ py: 10, backgroundColor: 'rgba(30, 41, 59, 0.3)' }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                }}
                            >
                                Powerful Features
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                                Everything you need to monitor traffic and detect violations with precision
                            </Typography>
                        </Box>
                    </motion.div>

                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 2,
                                                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 2,
                                                    color: feature.color,
                                                }}
                                            >
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Container maxWidth="md" sx={{ py: 12 }}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            textAlign: 'center',
                            p: 6,
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                            Ready to Get Started?
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                            Upload your traffic footage and experience the power of AI-driven analysis
                        </Typography>
                        <Button
                            component={Link}
                            to="/dashboard"
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForward />}
                            sx={{
                                px: 5,
                                py: 2,
                                fontSize: '1.1rem',
                            }}
                        >
                            Start Analyzing Now
                        </Button>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LandingPage;
