import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
} from '@mui/material';
import {
    Visibility,
    Speed,
    Psychology,
    Code,
    Storage,
    Cloud,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const AboutPage = () => {
    const technologies = [
        {
            name: 'YOLOv8',
            description: 'State-of-the-art object detection model for real-time vehicle tracking with exceptional accuracy.',
            icon: <Psychology sx={{ fontSize: 48 }} />,
            color: '#3b82f6',
        },
        {
            name: 'FastAPI',
            description: 'High-performance Python framework powering our backend with async capabilities and automatic API documentation.',
            icon: <Speed sx={{ fontSize: 48 }} />,
            color: '#10b981',
        },
        {
            name: 'React',
            description: 'Modern JavaScript library creating a responsive, interactive user interface with real-time updates.',
            icon: <Code sx={{ fontSize: 48 }} />,
            color: '#06b6d4',
        },
        {
            name: 'Computer Vision',
            description: 'Advanced CV algorithms for tracking vehicle trajectories, analyzing movement patterns, and detecting anomalies.',
            icon: <Visibility sx={{ fontSize: 48 }} />,
            color: '#a855f7',
        },
        {
            name: 'Deep Learning',
            description: 'Neural networks trained on thousands of traffic scenarios to identify wrong-way violations accurately.',
            icon: <Storage sx={{ fontSize: 48 }} />,
            color: '#f59e0b',
        },
        {
            name: 'Cloud Processing',
            description: 'Scalable infrastructure handling multiple video streams simultaneously with low latency.',
            icon: <Cloud sx={{ fontSize: 48 }} />,
            color: '#ef4444',
        },
    ];

    const timeline = [
        {
            phase: 'Research & Planning',
            description: 'Analyzed traffic violation patterns and identified key requirements for an effective monitoring system.',
        },
        {
            phase: 'Model Development',
            description: 'Trained and fine-tuned YOLOv8 model on diverse traffic datasets for optimal detection accuracy.',
        },
        {
            phase: 'System Integration',
            description: 'Built robust backend with FastAPI and integrated real-time video processing pipeline.',
        },
        {
            phase: 'UI/UX Design',
            description: 'Created intuitive dashboard with Material-UI for seamless user experience and data visualization.',
        },
    ];

    const values = [
        {
            title: 'Safety First',
            description: 'Our primary mission is to make roads safer by preventing wrong-way driving incidents.',
            icon: '🛡️',
        },
        {
            title: 'Innovation',
            description: 'Leveraging cutting-edge AI and computer vision to solve real-world traffic challenges.',
            icon: '💡',
        },
        {
            title: 'Accuracy',
            description: 'Committed to delivering precise detection with minimal false positives.',
            icon: '🎯',
        },
        {
            title: 'Accessibility',
            description: 'Making advanced traffic monitoring technology accessible to everyone.',
            icon: '🌍',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', py: 8 }}>
            {/* Hero Section */}
            <Container maxWidth="lg">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.div variants={staggerItem}>
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Chip
                                label="About TrafficGuard AI"
                                sx={{
                                    mb: 3,
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    color: 'primary.main',
                                    fontWeight: 600,
                                }}
                            />
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Revolutionizing Traffic Safety
                                <br />
                                with Artificial Intelligence
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8 }}
                            >
                                TrafficGuard AI is an advanced traffic monitoring system that uses deep learning
                                and computer vision to detect wrong-way driving violations in real-time, helping
                                prevent accidents and save lives.
                            </Typography>
                        </Box>
                    </motion.div>
                </motion.div>

                {/* Mission Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Card
                        sx={{
                            mb: 8,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            p: 4,
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                            Our Mission
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ textAlign: 'center', lineHeight: 1.8, fontWeight: 400 }}
                        >
                            To leverage the power of artificial intelligence and computer vision to create
                            safer roads by detecting and preventing traffic violations before they lead to
                            accidents. We believe that technology can be a powerful force for public safety,
                            and we're committed to making advanced traffic monitoring accessible and effective.
                        </Typography>
                    </Card>
                </motion.div>

                {/* Values Section */}
                <Box sx={{ mb: 10 }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
                            Our Values
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                                        <Typography sx={{ fontSize: '3rem', mb: 2 }}>{value.icon}</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            {value.description}
                                        </Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Technology Stack Section */}
                <Box sx={{ mb: 10 }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                            Technology Stack
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mb: 6, maxWidth: 700, mx: 'auto' }}
                        >
                            Built with cutting-edge technologies to deliver fast, accurate, and reliable results
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {technologies.map((tech, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 3,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                width: '4px',
                                                background: tech.color,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${tech.color}20, ${tech.color}10)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 3,
                                                color: tech.color,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {tech.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                                {tech.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                {tech.description}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Development Timeline */}
                <Box sx={{ mb: 8 }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
                            Development Journey
                        </Typography>
                    </motion.div>

                    <Box sx={{ position: 'relative' }}>
                        {timeline.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 3,
                                        mb: 4,
                                        position: 'relative',
                                        '&::before': index < timeline.length - 1 ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: '19px',
                                            top: '40px',
                                            bottom: '-32px',
                                            width: '2px',
                                            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.5), rgba(168, 85, 247, 0.5))',
                                        } : {},
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {index + 1}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                            {item.phase}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default AboutPage;
