import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";


// Get interpretation and color for capability indices
const getCapabilityInterpretation = (index: string, value: number): { text: string, color: 'success' | 'warning' | 'error' } => {
  switch (index) {
    case 'cp':
    case 'cpk':
      if (value >= 1.33) return { text: 'Adecuado (≥1.33)', color: 'success' };
      if (value >= 1.0) return { text: 'Parcialmente Capaz (1.00-1.32)', color: 'warning' };
      return { text: 'No Capaz (<1.00)', color: 'error' };

    case 'k':
      if (value < 10) return { text: 'Centrado Adecuado (<10%)', color: 'success' };
      if (value < 20) return { text: 'Centrado Aceptable (10-20%)', color: 'warning' };
      return { text: 'Centrado Inadecuado (>20%)', color: 'error' };

    case 'cpm':
      if (value >= 1.33) return { text: 'Cumple Objetivo (≥1.33)', color: 'success' };
      if (value >= 1.0) return { text: 'Cumple Parcialmente (1.00-1.32)', color: 'warning' };
      return { text: 'No Cumple Objetivo (<1.00)', color: 'error' };

    default:
      return { text: 'No disponible', color: 'warning' };
  }
};
// Añadir estas funciones junto con getCapabilityInterpretation
const getDpmoInterpretation = (value: number): { color: 'success' | 'warning' | 'error' } => {
  if (value <= 3400) return { color: 'success' };
  if (value <= 66800) return { color: 'warning' };
  return { color: 'error' };
};

const getSigmaInterpretation = (value: number): { color: 'success' | 'warning' | 'error' } => {
  if (value >= 4.5) return { color: 'success' };
  if (value >= 3.0) return { color: 'warning' };
  return { color: 'error' };
};

const ResumenEstadistico: React.FC<{ results: any, ctq: any }> = ({ results, ctq }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:360px)'); // Para pantallas muy pequeñas

  // Si estamos en móvil, mostramos un diseño compacto sin tablas
  if (isMobile) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: isSmallMobile ? 1.5 : 2,
          borderRadius: '8px',
          overflow: 'hidden' // Evita desbordamiento
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 1.5,
            fontSize: isSmallMobile ? '0.95rem' : '1.1rem'
          }}
        >
          Resumen Estadístico
        </Typography>

        {/* Estadísticas básicas en un formato compacto */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }} >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  height: '100%'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? '0.65rem' : '0.7rem' }}
                >
                  Media (μ)
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.input_data.mean.toFixed(3)} {ctq?.unit}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6 }} >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  height: '100%'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? '0.65rem' : '0.7rem' }}
                >
                  Desv. Estándar (σ)
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.input_data.std_dev.toFixed(3)} {ctq?.unit}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6 }} >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  height: '100%'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? '0.65rem' : '0.7rem' }}
                >
                  Tamaño de Muestra
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.input_data.sample_size}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6 }} >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  height: '100%'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? '0.65rem' : '0.7rem' }}
                >
                  Rango o Tolerancia
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {ctq?.specification?.tolerance || "N/A"} {ctq?.unit}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mt: 1,
            fontSize: isSmallMobile ? '0.85rem' : '0.95rem'
          }}
        >
          Índices de Capacidad
        </Typography>

        {/* Versión compacta de los índices para móvil */}
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          {/* Cp */}
          <Grid size={{ xs: 6 }} >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                p: 1.5,
                borderRadius: '4px',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.8rem' }}
                >
                  Cp
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.results.cp.toFixed(2)}
                </Typography>
              </Box>
              <Chip
                label={getCapabilityInterpretation('cp', results.results.cp).text}
                color={getCapabilityInterpretation('cp', results.results.cp).color}
                size="small"
                sx={{
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                  '& .MuiChip-label': {
                    px: isSmallMobile ? 0.5 : 0.8
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Cpk */}
          <Grid size={{ xs: 6 }} >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                p: 1.5,
                borderRadius: '4px',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.8rem' }}
                >
                  Cpk
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.results.cpk.toFixed(2)}
                </Typography>
              </Box>
              <Chip
                label={getCapabilityInterpretation('cpk', results.results.cpk).text}
                color={getCapabilityInterpretation('cpk', results.results.cpk).color}
                size="small"
                sx={{
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                  '& .MuiChip-label': {
                    px: isSmallMobile ? 0.5 : 0.8
                  }
                }}
              />
            </Box>
          </Grid>

          {/* DPMO */}
          <Grid size={{ xs: 6 }} >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                p: 1.5,
                borderRadius: '4px',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.8rem' }}
                >
                  DPMO
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{
                    fontSize: isSmallMobile ? '0.75rem' : '0.8rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {results.dpmo.toLocaleString()}
                </Typography>
              </Box>
              <Chip
                label={results.interpretation.dpmo}
                color={getDpmoInterpretation(results.dpmo).color}
                size="small"
                sx={{
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                  '& .MuiChip-label': {
                    px: isSmallMobile ? 0.5 : 0.8
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Nivel Sigma */}
          <Grid size={{ xs: 6 }} >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                p: 1.5,
                borderRadius: '4px',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.8rem' }}
                >
                  Nivel Sigma
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.9rem' }}
                >
                  {results.sigma_level.toFixed(2)}σ
                </Typography>
              </Box>
              <Chip
                label={results.interpretation.sigma}
                color={getSigmaInterpretation(results.sigma_level).color}
                size="small"
                sx={{
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                  '& .MuiChip-label': {
                    px: isSmallMobile ? 0.5 : 0.8
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  // Versión desktop con tabla
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 2 }}
      >
        Resumen Estadístico
      </Typography>

      <Grid container spacing={2}>
        {/* Corregido: de size={{ xs: 12, sm: 6}} a item xs={12} sm={6} */}
        <Grid size={{ xs: 12, sm: 6 }} >
          <Typography variant="body2" color="text.secondary">
            Media (μ)
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {results.input_data.mean.toFixed(3)} {ctq?.unit}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Typography variant="body2" color="text.secondary">
            Desv. Estándar (σ)
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {results.input_data.std_dev.toFixed(3)} {ctq?.unit}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Typography variant="body2" color="text.secondary">
            Tamaño de Muestra
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {results.input_data.sample_size}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Typography variant="body2" color="text.secondary">
            Rango
          </Typography>
          <Typography variant="body1" fontWeight="medium">
             {ctq?.specification?.tolerance || "N/A"} {ctq?.unit}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Índices de Capacidad
      </Typography>

      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Índice</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Interpretación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Cp</TableCell>
              <TableCell align="right">{results.results.cp.toFixed(2)}</TableCell>
              <TableCell>
                <Chip
                  label={getCapabilityInterpretation('cp', results.results.cp).text}
                  color={getCapabilityInterpretation('cp', results.results.cp).color}
                  size="small"
                  sx={{ fontSize: '0.8rem' }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>CpK</TableCell>
              <TableCell align="right">{results.results.cpk.toFixed(2)}</TableCell>
              <TableCell>
                <Chip
                  label={getCapabilityInterpretation('cpk', results.results.cpk).text}
                  color={getCapabilityInterpretation('cpk', results.results.cpk).color}
                  size="small"
                  sx={{ fontSize: '0.8rem' }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>DPMO</TableCell>
              <TableCell align="right">{results.dpmo.toLocaleString()}</TableCell>
              <TableCell>
                <Chip
                  label={results.interpretation.dpmo}
                  color={getDpmoInterpretation(results.dpmo).color}
                  size="small"
                  sx={{ fontSize: '0.8rem' }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nivel Sigma</TableCell>
              <TableCell align="right">{results.sigma_level.toFixed(2)}</TableCell>
              <TableCell>
                <Chip
                  label={results.interpretation.sigma}
                  color={getSigmaInterpretation(results.sigma_level).color}
                  size="small"
                  sx={{ fontSize: '0.8rem' }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResumenEstadistico;  