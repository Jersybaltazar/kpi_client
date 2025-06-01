import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { StudyResponse, CTQResponse } from '../../../types'; // Ajustar ruta
import CapabilityChart from '../../../components/CapabilityChart';

interface StudyResultsProps {
  studyData: StudyResponse | null;
  ctqData: CTQResponse | null; // Necesitamos LSL/USL/N para el gráfico
}

const StudyResults: React.FC<StudyResultsProps> = ({ studyData, ctqData }) => {
  if (!studyData || !ctqData) {
    return null; // O un mensaje indicando que no hay resultados
  }

  const { results, input_mean, input_std_dev } = studyData;
  const { specification } = ctqData;

  // Función auxiliar para determinar color de Chip basado en interpretación
  const getChipColor = (interpretation?: string): "success" | "warning" | "error" | "default" => {
      if (!interpretation) return "default";
      if (interpretation.includes("Adecuado") || interpretation.includes("Capaz") || interpretation.includes("Clase Mundial") || interpretation.includes("Aceptable")) return "success";
      if (interpretation.includes("Parcialmente")) return "warning";
      if (interpretation.includes("No Adecuado") || interpretation.includes("No Capaz") || interpretation.includes("Inadecuado") || interpretation.includes("Serias")) return "error";
      return "default";
  }


  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>Resultados del Estudio de Capacidad</Typography>

      {/* Tabla de Índices */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Índice</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Interpretación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.cp !== null && (
              <TableRow>
                <TableCell component="th" scope="row">Cp</TableCell>
                <TableCell align="right">{results.cp?.toFixed(3)}</TableCell>
                <TableCell><Chip label={results.interpretation?.cp || 'N/A'} size="small" color={getChipColor(results.interpretation?.cp)} /></TableCell>
              </TableRow>
            )}
             {results.cpk !== null && (
              <TableRow>
                <TableCell component="th" scope="row">Cpk</TableCell>
                <TableCell align="right">{results.cpk?.toFixed(3)}</TableCell>
                 <TableCell><Chip label={results.interpretation?.cpk || 'N/A'} size="small" color={getChipColor(results.interpretation?.cpk)} /></TableCell>
              </TableRow>
            )}
             {results.k !== null && (
              <TableRow>
                <TableCell component="th" scope="row">K (%)</TableCell>
                <TableCell align="right">{results.k?.toFixed(1)}%</TableCell>
                 <TableCell><Chip label={results.interpretation?.k || 'N/A'} size="small" color={getChipColor(results.interpretation?.k)} /></TableCell>
              </TableRow>
            )}
            {results.cpm !== null && (
              <TableRow>
                <TableCell component="th" scope="row">Cpm</TableCell>
                <TableCell align="right">{results.cpm?.toFixed(3)}</TableCell>
                 <TableCell><Chip label={results.interpretation?.cpm || 'N/A'} size="small" color={getChipColor(results.interpretation?.cpm)} /></TableCell>
              </TableRow>
            )}
             {/* Añadir filas para Cr, Cpi, Cps si se desea */}
          </TableBody>
        </Table>
      </TableContainer>

       {/* Mostrar errores si existen */}
       {results.errors && results.errors.length > 0 && (
           <Box sx={{ color: 'error.main', mb: 2 }}>
               <Typography variant="subtitle2">Errores:</Typography>
               <ul>
                   {results.errors.map((err, index) => <li key={index}>{err}</li>)}
               </ul>
           </Box>
       )}

      {/* Gráfico de Capacidad */}
      <Box sx={{ height: 400 }}> {/* Dar altura al contenedor del gráfico */}
        <CapabilityChart
          mean={input_mean}
          stdDev={input_std_dev}
          usl={specification.usl}
          lsl={specification.lsl}
          nominal={specification.nominal}
        />
      </Box>
    </Paper>
  );
};

export default StudyResults;