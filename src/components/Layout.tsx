import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SpeedIcon from '@mui/icons-material/Speed';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Definición del tema personalizado con la nueva paleta de colores
const theme = createTheme({
  palette: {
    primary: {
      main: '#334155', // slate-700
      dark: '#1e293b', // slate-800
      light: '#475569', // slate-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // teal-700
      dark: '#115e59', // teal-800
      light: '#14b8a6', // teal-500
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9', // slate-100
      paper: '#ffffff',
    },
    text: {
      primary: '#334155', // slate-700
      secondary: '#64748b', // slate-500
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 8,
        },
      },
    },
  },
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);
  const [mobileMenu, setMobileMenu] = useState<null | HTMLElement>(null);

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenu(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenu(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenu(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="primary" elevation={2}>
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { md: 'none' } }}
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Sigma Facil
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Button color="inherit" onClick={() => navigate('/')}>INICIO</Button>
                <Button color="inherit" onClick={() => navigate('/ctqs/new')}>DEFINIR CTQ</Button>
                <Button 
                  color="inherit" 
                  endIcon={<KeyboardArrowDownIcon />}
                  onClick={handleLanguageMenuOpen}
                  sx={{ ml: 2 }}
                >
                  español
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Menu
            anchorEl={languageMenu}
            open={Boolean(languageMenu)}
            onClose={handleLanguageMenuClose}
          >
            <MenuItem onClick={handleLanguageMenuClose}>inglés</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose} selected>español</MenuItem>
          </Menu>
          <Menu
            anchorEl={mobileMenu}
            open={Boolean(mobileMenu)}
            onClose={handleMobileMenuClose}
          >
            <MenuItem onClick={() => { navigate('/'); handleMobileMenuClose(); }}>INICIO</MenuItem>
            <MenuItem onClick={() => { navigate('/ctqs'); handleMobileMenuClose(); }}>VER CTQS</MenuItem>
            <MenuItem onClick={() => { navigate('/ctqs/new'); handleMobileMenuClose(); }}>DEFINIR CTQ</MenuItem>
            <Divider />
            <MenuItem onClick={handleMobileMenuClose}>español</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>inglés</MenuItem>
          </Menu>
        </Box>

        {/* Contenido Principal de la Página */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: 0,
            py: 3,
            width: '100%',
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              {'© '}
              {new Date().getFullYear()}
              {' Sigma Facil. Todos los derechos reservados.'}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;