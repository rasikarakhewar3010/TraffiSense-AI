import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6', // Blue
            light: '#60a5fa',
            dark: '#2563eb',
        },
        secondary: {
            main: '#a855f7', // Purple
            light: '#c084fc',
            dark: '#9333ea',
        },
        background: {
            default: '#0f172a', // Slate-900
            paper: '#1e293b', // Slate-800
        },
        text: {
            primary: '#f8fafc', // Slate-50
            secondary: '#94a3b8', // Slate-400
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 700,
            fontSize: '3.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.4,
        },
        h4: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.5,
        },
        h6: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.7,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 30px rgba(168, 85, 247, 0.3)',
        '0 10px 40px rgba(59, 130, 246, 0.2)',
        '0 10px 40px rgba(168, 85, 247, 0.2)',
        ...Array(15).fill('none'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;
