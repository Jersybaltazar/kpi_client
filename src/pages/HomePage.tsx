import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Divider,
  createTheme,
  ThemeProvider,
} from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';
import MemoryIcon from '@mui/icons-material/Memory';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { useNavigate } from 'react-router-dom';

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Características destacadas del sistema con nuevos iconos
  const features = [
    {
      title: 'Definir CTQs',
      description: 'Establece especificaciones para las Características Críticas para la Calidad de tus procesos.',
      icon: <SettingsIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      action: () => navigate('/ctqs/new'),
      borderColor: theme.palette.secondary.main
    },
    {
      title: 'Estudios de Capacidad',
      description: 'Analiza datos del proceso y calcula índices de capacidad (Cp, Cpk, Cpm) automáticamente.',
      icon: <MemoryIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      action: () => navigate('/ctqs'),
      borderColor: theme.palette.primary.main
    },
    {
      title: 'Visualización de Resultados',
      description: 'Visualiza la distribución de tus datos y evalúa el cumplimiento de especificaciones.',
      icon: <ShowChartIcon sx={{ fontSize: 60, color: theme.palette.info.main }} />,
      action: () => navigate('/ctqs'),
      borderColor: theme.palette.info.main
    },
  ];


  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: { xs: 3, sm: 4, md: 6 },
            borderRadius: 2,
            mb: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, textAlign: 'center' }}>
              Sigma Facil
            </Typography>
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{
                maxWidth: { xs: '100%', sm: '90%', md: '80%' },
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                textAlign: 'center',
                mx: 'auto'
              }}
            >
              Herramienta para evaluar y mejorar la capacidad de tus procesos de manufactura
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/ctqs/new')}
                fullWidth={window.innerWidth < 600} // Responsive en pantallas pequeñas
                sx={{ mb: { xs: 2, sm: 0 } }}
              >
                Definir Nueva CTQ
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/ctqs')}
                fullWidth={window.innerWidth < 600} // Responsive en pantallas pequeñas
              >
                Ver CTQs Existentes
              </Button>
            </Box>
          </Box>
        </Paper>
      
        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 4, textAlign: 'center', color: theme.palette.text.primary }}>
          Funcionalidades Principales
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs:12 , md:4}} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderLeft: `4px solid ${feature.borderColor}`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.grey[100]
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={feature.action}
                  >
                    Explorar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Getting started section */}
        <Paper sx={{ 
          p: 4, 
          mt: 6, 
          bgcolor: theme.palette.grey[50],
          borderLeft: `4px solid ${theme.palette.secondary.main}`,
          borderRadius: 2
        }}>
          <Typography variant="h5" component="h3" gutterBottom color="text.primary">
            ¿Cómo comenzar?
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            1. Define las Características Críticas para la Calidad (CTQs) de tu proceso.
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            2. Recolecta datos del proceso y crea un nuevo estudio de capacidad.
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            3. Analiza los resultados y toma decisiones basadas en los índices de capacidad.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/ctqs/new')}
            sx={{ mt: 2 }}
          >
            Comenzar Ahora
          </Button>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;