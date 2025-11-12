import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4F46E5', // Indigo 600 — trust & focus
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#F8FAFC',
    },
    secondary: {
      main: '#9333EA', // Purple 600 — energy & creativity
      light: '#A855F7',
      dark: '#7E22CE',
      contrastText: '#F8FAFC',
    },
    background: {
      default: '#0F172A', // Slate 950 — immersive base
      paper: '#1E293B', // Slate 800 — surface for cards & modals
    },
    text: {
      primary: '#F8FAFC', // Main readable text
      secondary: '#CBD5E1', // Muted / metadata text
      disabled: '#64748B', // Disabled or low-priority content
    },
    success: {
      main: '#22C55E', // Emerald 500 — growth signals
      contrastText: '#0F172A',
    },
    warning: {
      main: '#F59E0B', // Amber 500 — alerts & highlights
      contrastText: '#0F172A',
    },
    error: {
      main: '#EF4444', // Red 500 — moderation / rejection
      contrastText: '#F8FAFC',
    },
    info: {
      main: '#38BDF8', // Sky 400 — links, info states
      contrastText: '#0F172A',
    },
    divider: '#334155', // Subtle borders between sections
  },

  typography: {
    fontFamily: "'Inter', 'Rajdhani', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.4rem',
      color: '#F8FAFC',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.8rem',
      color: '#F8FAFC',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#E2E8F0',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      color: '#CBD5E1',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      color: '#94A3B8',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px 20px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)', // Glow effect
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #9333EA 0%, #22C55E 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A855F7 0%, #34D399 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(79,70,229,0.25)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          border: '1px solid #334155',
          boxShadow: '0 2px 10px rgba(79,70,229,0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #4F46E5, #9333EA)',
          boxShadow: '0 0 8px rgba(79,70,229,0.4)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#334155',
        },
      },
    },
  },
});
