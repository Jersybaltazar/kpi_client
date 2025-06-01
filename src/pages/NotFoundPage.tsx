import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Página No Encontrada
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Volver al Inicio
      </Button>
    </Container>
  );
};

export default NotFoundPage;