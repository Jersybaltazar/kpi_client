import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
// Aquí iría la lógica para obtener y mostrar la lista de CTQs (usando React Query)
// import CTQList from '../features/ctq/components/CTQList'; // Ejemplo

const CtqListPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Características de Calidad (CTQs)
      </Typography>
      <Button
         variant="contained"
         component={RouterLink}
         to="/ctqs/new"
         startIcon={<AddIcon />}
         sx={{ mb: 2 }}
      >
         Definir Nueva CTQ
      </Button>
      {/* Placeholder para la tabla/lista */}
      <Typography>Lista de CTQs aparecerá aquí...</Typography>
      {/* <CTQList /> */}
    </Container>
  );
};

export default CtqListPage;