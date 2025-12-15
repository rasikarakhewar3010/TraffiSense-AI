import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Container,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';

const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Dashboard', path: '/dashboard' },
];

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (path) => location.pathname === path;

    const drawer = (
        <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, mb: 2 }}>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            onClick={handleDrawerToggle}
                            sx={{
                                backgroundColor: isActive(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                borderLeft: isActive(item.path) ? '3px solid #3b82f6' : '3px solid transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                },
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 600 : 400,
                                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box
                                component={Link}
                                to="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                                    }}
                                >
                                    <VisibilityIcon sx={{ color: 'white', fontSize: 24 }} />
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
                        </motion.div>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {navItems.map((item, index) => (
                                        <motion.div
                                            key={item.path}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 * index }}
                                        >
                                            <Button
                                                component={Link}
                                                to={item.path}
                                                sx={{
                                                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                                                    fontWeight: isActive(item.path) ? 600 : 500,
                                                    px: 2,
                                                    position: 'relative',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: isActive(item.path) ? '80%' : '0%',
                                                        height: '2px',
                                                        background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                                                        transition: 'width 0.3s ease',
                                                    },
                                                    '&:hover::after': {
                                                        width: '80%',
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                                    },
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </Box>
                            </motion.div>
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: 'background.paper',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navbar;
