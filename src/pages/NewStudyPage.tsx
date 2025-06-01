import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { useCtqById } from '../hooks/use-ctqs';
import { createStudy } from '../api';
import Gauss from '../components/Gauss';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import CapabilityHistogram from '../components/CapabilityHistogram';
import { adaptStudyResponseToCapabilityData } from '../utils/adaptStudyResponseToCapabilityData';
import TabPanel from '../components/TabPanel';
import ResumenEstadistico from '../components/ResumenEstadistico';
import AnalisisCapacidad from '../components/AnalisisCapacidad';
import CurvaGauss from '../components/CurvaGauss';
import GraficoControl from '../components/GraficoControl';
// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);


const NewStudyPage: React.FC = () => {
  const { ctqId } = useParams<{ ctqId: string }>();
  const [rawData, setRawData] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [results, setResults] = useState<any>(null);
  const { ctq, loading, error } = useCtqById(ctqId || '');
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<'none' | 'file' | 'manual'>('none');
  const [currentMeasurement, setCurrentMeasurement] = useState<string>('');
  const [measurementsList, setMeasurementsList] = useState<number[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'summary' | 'capacity' | 'gauss' | 'control' | null>(null);
  // In a real app, fetch the CTQ data based on ctqId

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenModal = (content: 'summary' | 'capacity' | 'gauss' | 'control') => {
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  // Handle raw data input changes
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawData(e.target.value);
  };

  // Process raw text data into numerical array
  const processRawData = (text: string): number[] => {
    // Split by common delimiters (spaces, commas, newlines)
    const values = text
      .split(/[\s,\n]+/) // Divide por espacios, comas o saltos de línea
      .map(val => val.trim())
      .filter(val => val !== '')
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val));

    return values;
  };

  const handleAnalyze = async () => {
    // Determinar qué datos enviar según el modo de entrada
    let measurements: number[] = [];

    if (inputMode === 'manual') {
      measurements = measurementsList;
    } else if (inputMode === 'file') {
      measurements = processRawData(rawData);
    } else {
      measurements = processRawData(rawData);
    }

    if (measurements.length === 0) {
      alert('Por favor, ingrese datos válidos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const studyDate = new Date().toISOString();
      const response = await createStudy(ctqId || '', {
        raw_measurements: measurements,
        study_date_override: studyDate,
      });
      setResults(response);
      setShowResults(true);
    } catch (err) {
      console.error('Error al crear el estudio:', err);
      alert('Ocurrió un error al analizar los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputMode('file');
    const reader = new FileReader();

    if (file.type === 'text/csv') {
      // Procesar archivo CSV
      reader.onload = (event) => {
        const csvData = event.target?.result as string;
        const parsed = Papa.parse(csvData, { header: false });
        const measurements = parsed.data.flat().map((val) => parseFloat(val as string)).filter((val: number) => !isNaN(val));
        // Mostrar con comas para mejor visualización
        setRawData(measurements.join(', '));
        setMeasurementsList(measurements);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      // Procesar archivo Excel
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const measurements = sheetData.flat().map((val: any) => parseFloat(val)).filter((val) => !isNaN(val));
        // Mostrar con comas para mejor visualización
        setRawData(measurements.join(', '));
        setMeasurementsList(measurements);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Formato de archivo no soportado. Por favor, suba un archivo CSV o Excel.');
    }
  };

  const handleAddMeasurement = () => {
    const value = parseFloat(currentMeasurement);
    if (!isNaN(value)) {
      setMeasurementsList([...measurementsList, value]);
      setCurrentMeasurement('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMeasurement();
    }
  };

  const handleRemoveMeasurement = (index: number) => {
    const newList = [...measurementsList];
    newList.splice(index, 1);
    setMeasurementsList(newList);
  };
  useEffect(() => {
    if (inputMode === 'manual') {
      setRawData(measurementsList.join(', '));
    }
  }, [measurementsList, inputMode]);

  // Prepare chart data
  const chartData = results
    ? {
      labels: results.results.histogram.bins,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Histograma',
          data: results.results.histogram.counts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    }
    : null;


  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: '100%',
        px: isMobile ? 1 : 2 // Padding horizontal reducido en móvil
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : isTablet ? 3 : 4,
          mt: isMobile ? 2 : 4,
          mb: isMobile ? 2 : 4,
          width: '100%',
          borderRadius: isMobile ? '8px' : '12px'
        }}
      >
        {/* Header */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              fontSize: isMobile ? '0.85rem' : 'inherit'
            }}
          >
            {error}
          </Alert>
        )}
        {!loading && !error && ctq && (
          <>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: isMobile ? '1.2rem' : isTablet ? '2rem' : '2.25rem',
                lineHeight: 1.2,
                mb: isMobile ? 1 : 2
              }}
            >
              Realizar un nuevo estudio para:
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                color: '#2196f3',
                mb: isMobile ? 1.5 : 2,
                fontWeight: 500,
                fontSize: isMobile ? '1.15rem' : 'inherit'
              }}
            >
              {ctq.name}
            </Typography>

            <Card
              variant="outlined"
              sx={{
                mb: isMobile ? 2 : 3,
                backgroundColor: '#f5f9ff',
                borderRadius: '8px'
              }}
            >
              <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    color: '#1976d2'
                  }}
                >
                  Especificaciones del CTQ:
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    flexWrap: 'wrap',
                    gap: isMobile ? 1 : 2
                  }}
                >
                  <Chip
                    label={`LSL: ${ctq.specification.lsl} ${ctq.unit}`}
                    size={isMobile ? "small" : "medium"}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />

                  <Chip
                    label={`USL: ${ctq.specification.usl} ${ctq.unit}`}
                    size={isMobile ? "small" : "medium"}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />

                  {ctq.specification.nominal && (
                    <Chip
                      label={`Nominal: ${ctq.specification.nominal} ${ctq.unit}`}
                      size={isMobile ? "small" : "medium"}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
            <Divider sx={{ my: isMobile ? 2 : 3 }} />
          </>
        )}

        {/* Formulario de entrada de datos */}
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              mb: 1.5,
              fontWeight: 500,
              fontSize: isMobile ? '1.05rem' : '1.25rem'
            }}
          >
            <AssignmentIcon
              sx={{
                verticalAlign: 'middle',
                mr: 1,
                fontSize: isMobile ? '1.1rem' : '1.3rem'
              }}
            />
            Ingresar Mediciones:
          </Typography>

          {/* Botones de selección de modo - Optimizados para móvil */}
          {inputMode === 'none' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                mb: 3
              }}
            >
              <Button
                variant="contained"
                component="label"
                fullWidth={isMobile}
                startIcon={<UploadFileIcon />}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  boxShadow: isMobile ? 1 : 2,
                  borderRadius: '8px'
                }}
              >
                Subir Archivo
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>

              <Button
                variant="outlined"
                fullWidth={isMobile}
                onClick={() => setInputMode('manual')}
                startIcon={<CalculateIcon />}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  borderRadius: '8px'
                }}
              >
                Digitar Manualmente
              </Button>
            </Box>
          )}

          {/* Modo Archivo */}
          {inputMode === 'file' && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  mb: 2,
                  gap: isMobile ? 1 : 2
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    color: '#0d47a1',
                    fontSize: isMobile ? '0.9rem' : 'inherit',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <InsertChartIcon sx={{ mr: 0.5, fontSize: isMobile ? '1rem' : '1.2rem' }} />
                  Modo: Archivo
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setInputMode('none');
                    setRawData('');
                    setMeasurementsList([]);
                  }}
                  sx={{
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    borderRadius: '6px'
                  }}
                >
                  Cambiar Modo
                </Button>
              </Box>

              <TextField
                label="Datos Cargados desde Archivo"
                multiline
                rows={isMobile ? 4 : 6}
                value={rawData}
                onChange={handleDataChange}
                placeholder="Los datos del archivo aparecerán aquí"
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    fontSize: isMobile ? '0.85rem' : 'inherit',
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 2
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  fullWidth={isMobile}
                  sx={{
                    fontSize: isMobile ? '0.85rem' : 'inherit',
                    py: isMobile ? 1 : undefined,
                    borderRadius: '8px'
                  }}
                >
                  Cambiar Archivo
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyze}
                  disabled={isSubmitting || !rawData}
                  fullWidth={isMobile}
                  sx={{
                    fontSize: isMobile ? '0.85rem' : 'inherit',
                    py: isMobile ? 1 : undefined,
                    borderRadius: '8px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={isMobile ? 16 : 20} sx={{ mr: 1 }} />
                      Analizando...
                    </>
                  ) : 'Analizar Datos'}
                </Button>
              </Box>
            </>
          )}

          {/* Modo Manual */}
          {inputMode === 'manual' && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  mb: 2,
                  gap: isMobile ? 1 : 2
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    color: '#0d47a1',
                    fontSize: isMobile ? '0.9rem' : 'inherit',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Modo: Manual
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setInputMode('none');
                    setRawData('');
                    setMeasurementsList([]);
                  }}
                  sx={{
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    borderRadius: '6px'
                  }}
                >
                  Cambiar Modo
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Nueva Medición"
                  value={currentMeasurement}
                  rows={isMobile ? 4 : 6}
                  onChange={(e) => setCurrentMeasurement(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: 75.01"
                  variant="outlined"
                  type="number"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: isMobile ? '0.85rem' : 'inherit',
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMeasurement}
                  disabled={!currentMeasurement}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: isMobile ? '0.85rem' : 'inherit',
                    }
                  }}
                >
                  Agregar
                </Button>
              </Box>

              {/* Lista de mediciones */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, maxHeight: '300px', overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Mediciones Ingresadas: {measurementsList.length}
                </Typography>
                {measurementsList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay mediciones ingresadas. Use el campo de arriba para agregar.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {measurementsList.map((value, index) => (
                      <Chip
                        key={index}
                        label={value}
                        onDelete={() => handleRemoveMeasurement(index)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>

              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={isSubmitting || measurementsList.length === 0}
                fullWidth={isMobile}
                sx={{
                  fontSize: isMobile ? '0.85rem' : 'inherit',
                  py: isMobile ? 1 : undefined,
                  borderRadius: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={isMobile ? 16 : 20} sx={{ mr: 1 }} />
                    Analizando...
                  </>
                ) : 'Analizar Datos'}
              </Button>
            </>
          )}
        </Box>

        {/* Resultados */}
        {results && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AssessmentIcon color="primary" />
              Resultados del Estudio
            </Typography>

            {/* Resumen Estadístico */}
            {isMobile && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={1}
                    onClick={() => handleOpenModal('summary')}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#f5f9ff',
                      borderRadius: '8px',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    <EqualizerIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="subtitle2">
                      Resumen Estadístico
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={1}
                    onClick={() => handleOpenModal('capacity')}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#f5f9ff',
                      borderRadius: '8px',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    <BarChartIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="subtitle2">
                      Análisis de Capacidad
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={1}
                    onClick={() => handleOpenModal('gauss')}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#f5f9ff',
                      borderRadius: '8px',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    <ShowChartIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="subtitle2">
                      Curva de Gauss
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={1}
                    onClick={() => handleOpenModal('control')}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#f5f9ff',
                      borderRadius: '8px',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    <TimelineIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="subtitle2">
                      Gráfico de Control
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Índices de Capacidad */}
            <Paper
              variant="outlined"
              sx={{
                p: isMobile ? 2 : 3,
                mb: 3,
                borderRadius: '8px',
                bgcolor: '#fafafa'
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: '#0d47a1',
                  fontSize: isMobile ? '0.95rem' : '1.1rem'
                }}
              >
                Métricas Principales
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Cp/Cpk
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {results.results.cp.toFixed(2)} / {results.results.cpk.toFixed(2)}
                      </Typography>
                      <Chip
                        label={results.results.cpk >= 1.33 ? "✓" : "!"}
                        color={results.results.cpk >= 1.33 ? "success" :
                          results.results.cpk >= 1.0 ? "warning" : "error"}
                        size="small"
                        sx={{ height: 20, minWidth: 20, '& .MuiChip-label': { p: 0.5 } }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Nivel Sigma
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {results.sigma_level.toFixed(2)}σ
                      </Typography>
                      <Chip
                        label={results.sigma_level >= 4.5 ? "✓" : "!"}
                        color={results.sigma_level >= 4.5 ? "success" :
                          results.sigma_level >= 3.0 ? "warning" : "error"}
                        size="small"
                        sx={{ height: 20, minWidth: 20, '& .MuiChip-label': { p: 0.5 } }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      DPMO
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {results.dpmo.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Rendimiento
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {(results.yield_value * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Versión desktop: Contenido completo con pestañas */}
            {!isMobile && (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant={isTablet ? "scrollable" : "fullWidth"}
                    scrollButtons={isTablet ? "auto" : false}
                    aria-label="análisis tabs"
                  >
                    <Tab
                      label="Resumen Estadístico"
                      icon={<EqualizerIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label="Análisis de Capacidad"
                      icon={<BarChartIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label="Curva de Gauss"
                      icon={<ShowChartIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label="Gráfico de Control"
                      icon={<TimelineIcon />}
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {/* Panel 0: Resumen Estadístico */}
                <TabPanel value={tabValue} index={0}>
                  <ResumenEstadistico results={results} ctq={ctq} />
                </TabPanel>

                {/* Panel 1: Análisis de Capacidad */}
                <TabPanel value={tabValue} index={1}>
                  <AnalisisCapacidad results={results} ctq={ctq} />
                </TabPanel>

                {/* Panel 2: Curva de Gauss */}
                <TabPanel value={tabValue} index={2}>
                  <CurvaGauss
                    data={inputMode === 'manual' ? measurementsList : processRawData(rawData)}
                    ctq={ctq}
                  />
                </TabPanel>

                {/* Panel 3: Gráfico de Control */}
                <TabPanel value={tabValue} index={3}>
                  <GraficoControl
                    data={inputMode === 'manual' ? measurementsList : processRawData(rawData)}
                    results={results}
                    ctq={ctq}
                  />
                </TabPanel>
              </Box>
            )}

            {/* Modal para dispositivos móviles */}
            <Dialog
              fullScreen={isMobile}
              open={modalOpen}
              onClose={handleCloseModal}
              PaperProps={{
                sx: {
                  borderRadius: isMobile ? 0 : '12px',
                  maxHeight: '90vh',
                  maxWidth: '95vw',
                  width: '100%'
                }
              }}
            >
              <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5
              }}>
                <Typography variant="h6">
                  {modalContent === 'summary' && 'Resumen Estadístico'}
                  {modalContent === 'capacity' && 'Análisis de Capacidad'}
                  {modalContent === 'gauss' && 'Curva de Gauss'}
                  {modalContent === 'control' && 'Gráfico de Control'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers>
                {modalContent === 'summary' && <ResumenEstadistico results={results} ctq={ctq} />}
                {modalContent === 'capacity' && <AnalisisCapacidad results={results} ctq={ctq} />}
                {modalContent === 'gauss' && (
                  <CurvaGauss
                    data={inputMode === 'manual' ? measurementsList : processRawData(rawData)}
                    ctq={ctq}
                  />
                )}
                {modalContent === 'control' && (
                  <GraficoControl
                    data={inputMode === 'manual' ? measurementsList : processRawData(rawData)}
                    results={results}
                    ctq={ctq}
                  />
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseModal} variant="outlined" fullWidth>
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </Container>
  );
};



export default NewStudyPage;