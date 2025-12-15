import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    Divider,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', path: '/#features' },
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Documentation', path: '#' },
        ],
        company: [
            { label: 'About Us', path: '/about' },
            { label: 'Contact', path: '#' },
            { label: 'Privacy Policy', path: '#' },
        ],
    };

    const socialLinks = [
        { icon: <GitHubIcon />, url: '#', label: 'GitHub' },
        { icon: <LinkedInIcon />, url: '#', label: 'LinkedIn' },
        { icon: <TwitterIcon />, url: '#', label: 'Twitter' },
    ];

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'background.paper',
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                mt: 'auto',
                py: 6,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Section */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                                    }}
                                >
                                    <VisibilityIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    TrafficGuard AI
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Advanced AI-powered traffic monitoring system for detecting wrong-way violations
                                and ensuring road safety.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {socialLinks.map((social) => (
                                    <IconButton
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                color: 'primary.main',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {social.icon}
                                    </IconButton>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Product Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Product
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {footerLinks.product.map((link) => (
                                    <Typography
                                        key={link.label}
                                        component={link.path.startsWith('#') ? 'a' : Link}
                                        to={link.path.startsWith('#') ? undefined : link.path}
                                        href={link.path.startsWith('#') ? link.path : undefined}
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                color: 'primary.main',
                                                paddingLeft: 1,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {link.label}
                                    </Typography>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Company Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Company
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {footerLinks.company.map((link) => (
                                    <Typography
                                        key={link.label}
                                        component={link.path.startsWith('#') ? 'a' : Link}
                                        to={link.path.startsWith('#') ? undefined : link.path}
                                        href={link.path.startsWith('#') ? link.path : undefined}
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                color: 'primary.main',
                                                paddingLeft: 1,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {link.label}
                                    </Typography>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {currentYear} TrafficGuard AI. All rights reserved.
                    </Typography>

                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
