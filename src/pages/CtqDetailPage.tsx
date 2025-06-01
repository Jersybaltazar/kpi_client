import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TablePagination,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useParams, useNavigate } from 'react-router-dom';
import { useCtqById, useCtqs } from '../hooks/use-ctqs';

const CtqDetailPage: React.FC = () => {
  const { ctqId } = useParams<{ ctqId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  // Hook para obtener el CTQ por ID
  const { ctq, loading: loadingCtq, error: errorCtq } = useCtqById(ctqId || '');

  // Hook para obtener todos los CTQs (historial)
  const { ctqs, loading: loadingCtqs, error: errorCtqs } = useCtqs();
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedCtqs = ctqs ? ctqs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: '100%',
        px: isMobile ? 1 : 2
      }}
    >
      <Paper
        elevation={isMobile ? 2 : 3}
        sx={{
          p: isMobile ? 2 : isTablet ? 3 : 4,
          mt: isMobile ? 2 : 4,
          mb: isMobile ? 2 : 4,
          width: '100%',
          borderRadius: isMobile ? '8px' : '12px'
        }}
      >
        {/* Botón de regreso para móvil */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <IconButton
              color="primary"
              onClick={() => navigate(-1)}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              component="span"
              sx={{ verticalAlign: 'middle', fontSize: '0.9rem' }}
            >
              Regresar
            </Typography>
          </Box>
        )}

        {/* Información del CTQ */}
        {loadingCtq ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={isMobile ? 36 : 40} />
          </Box>
        ) : errorCtq ? (
          <Alert severity="error" sx={{ mb: 2 }}>{errorCtq}</Alert>
        ) : (
          <>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: isSmallMobile ? '1.3rem' : isMobile ? '1.5rem' : undefined
              }}
            >
              CTQ: {ctq?.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={ctq?.unit}
                color="primary"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  ml: 1,
                  fontSize: isMobile ? '0.9rem' : undefined
                }}
              >
                Proceso: {ctq?.process_name}
              </Typography>
            </Box>

            <Divider sx={{ my: isMobile ? 2 : 3 }} />

            <Box sx={{ mb: isMobile ? 2 : 4 }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h5"}
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: isMobile ? '1.1rem' : undefined
                }}
              >
                Especificaciones
              </Typography>

              {isMobile ? (
                // Versión móvil: cards con especificaciones
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6 }} >
                    <Card variant="outlined" sx={{ bgcolor: '#f5f9ff' }}>
                      <CardContent sx={{ p: isSmallMobile ? 1 : 1.5, '&:last-child': { pb: isSmallMobile ? 1 : 1.5 } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          LSL
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ctq?.specification.lsl} {ctq?.unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Card variant="outlined" sx={{ bgcolor: '#f5f9ff' }}>
                      <CardContent sx={{ p: isSmallMobile ? 1 : 1.5, '&:last-child': { pb: isSmallMobile ? 1 : 1.5 } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          USL
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ctq?.specification.usl} {ctq?.unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Card variant="outlined" sx={{ bgcolor: '#f5f9ff' }}>
                      <CardContent sx={{ p: isSmallMobile ? 1 : 1.5, '&:last-child': { pb: isSmallMobile ? 1 : 1.5 } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Punto Medio (M)
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ctq?.specification.midpoint} {ctq?.unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Card variant="outlined" sx={{ bgcolor: '#f5f9ff' }}>
                      <CardContent sx={{ p: isSmallMobile ? 1 : 1.5, '&:last-child': { pb: isSmallMobile ? 1 : 1.5 } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Tolerancia
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ctq?.specification.tolerance} {ctq?.unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                // Versión desktop: grid layout
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body1" component="div">
                      <strong>LSL:</strong> {ctq?.specification.lsl} {ctq?.unit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" component="div">
                      <strong>USL:</strong> {ctq?.specification.usl} {ctq?.unit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" component="div">
                      <strong>Nominal (N):</strong> {ctq?.specification.nominal} {ctq?.unit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" component="div">
                      <strong>Tolerancia:</strong> {ctq?.specification.tolerance} {ctq?.unit}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Botón para realizar un nuevo estudio */}
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            startIcon={isMobile ? <PlayArrowIcon /> : <AssessmentIcon />}
            onClick={() => navigate(`/studies/new/${ctqId}`)}
            disabled={loadingCtq || !ctq}
            sx={{
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? '0.85rem' : undefined
            }}
          >
            {isMobile ? "Nuevo Estudio" : "Realizar Nuevo Estudio de Capacidad"}
          </Button>
        </Box>

        <Divider sx={{ my: isMobile ? 2 : 3 }} />

        {/* Historial */}
        <Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h5"}
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: isMobile ? '1.1rem' : undefined
            }}
          >
            Historial
          </Typography>

          {loadingCtqs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={isMobile ? 28 : 36} />
            </Box>
          ) : errorCtqs ? (
            <Alert severity="error" sx={{ mb: 2 }}>{errorCtqs}</Alert>
          ) : (
            <>
              {isMobile ? (
                // Versión móvil: Lista en lugar de tabla
                <Card variant="outlined">
                  <List disablePadding>
                    {paginatedCtqs.map((ctq, index) => (
                      <React.Fragment key={ctq.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem
                          component="button"
                          onClick={() => navigate(`/ctqs/${ctq.id}`)}
                          sx={{ py: 1 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {ctq.name}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {ctq.process_name}
                                </Typography>
                                <Typography variant="caption" color="primary">
                                  {ctq.unit}
                                </Typography>
                              </Box>
                            }
                            primaryTypographyProps={{ sx: { fontSize: isSmallMobile ? '0.85rem' : '0.9rem' } }}
                            secondaryTypographyProps={{ sx: { fontSize: isSmallMobile ? '0.75rem' : '0.8rem' } }}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}

                    {ctqs.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary="No hay elementos en el historial"
                          primaryTypographyProps={{ sx: { fontSize: '0.9rem', color: 'text.secondary', textAlign: 'center' } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Card>
              ) : (
                // Versión desktop: Tabla completa
                <TableContainer component={Paper} variant="outlined">
                  <Table sx={{ minWidth: 650 }} aria-label="historial de estudios">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Proceso</TableCell>
                        <TableCell>Unidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCtqs.map((ctq) => (
                        <TableRow
                          key={ctq.id}
                          hover
                          onClick={() => navigate(`/ctqs/${ctq.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{ctq.name}</TableCell>
                          <TableCell>{ctq.process_name}</TableCell>
                          <TableCell>{ctq.unit}</TableCell>
                        </TableRow>
                      ))}

                      {ctqs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No hay elementos en el historial
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {ctqs.length > 0 && (
                <TablePagination
                  component="div"
                  count={ctqs.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                  rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
                  SelectProps={{
                    inputProps: { 'aria-label': 'filas por página' },
                    native: true,
                  }}
                  sx={{
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select': {
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    },
                    '.MuiTablePagination-actions': {
                      marginLeft: isMobile ? 0 : 2,
                    }
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CtqDetailPage;