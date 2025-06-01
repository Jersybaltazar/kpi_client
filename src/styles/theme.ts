import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Crear una instancia de tema
const theme = createTheme({
  palette: {
    mode: 'light', // O 'dark'
    primary: {
      main: '#556cd6', // Azul índigo como primario
    },
    secondary: {
      main: '#19857b', // Verde azulado como secundario
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f6f8', // Un gris claro para el fondo
    },
  },
  components:{
    MuiContainer:{
      defaultProps:{
        maxWidth: false,
      }
    }
  },
  typography: {
    // Puedes personalizar fuentes, tamaños, etc. aquí
    // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  // Puedes añadir personalizaciones de componentes aquí
  // components: { MuiButton: { defaultProps: { variant: 'contained' } } }
});

export default theme;