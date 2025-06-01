import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Paper,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { useProcesses } from '../hooks/use-process';
import { defineCtq } from '../api';
import { CTQCreationRequest } from '../types';



const DefineCTQPage: React.FC = () => {
  const navigate = useNavigate();
  const { processes, loading: loadingProcesses, error: processError } = useProcesses();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 8px' : '0', // Menos padding en móvil
    },
    header: {
      backgroundColor: '#1e2a3a',
      color: 'white',
      padding: isMobile ? '12px 16px' : '16px 24px', // Menos padding en móvil
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '16px' : '30px', // Menos margen en móvil
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: isMobile ? '1.1rem' : '1.3rem', // Texto más pequeño en móvil
    },
    paper: {
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      padding: isMobile ? '16px' : isTablet ? '24px' : '32px', // Padding progresivo
      marginBottom: isMobile ? '16px' : '30px',
    },
    pageTitle: {
      fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem', // Tamaño progresivo
      fontWeight: 'bold',
      color: '#1e2a3a',
      marginBottom: isMobile ? '16px' : '24px',
    },
    infoBox: {
      backgroundColor: '#e8f4fd',
      borderLeft: '4px solid #2196f3',
      padding: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '16px' : '24px',
      display: 'flex',
      alignItems: 'flex-start',
    },
    infoIcon: {
      color: '#2196f3',
      marginRight: '12px',
      marginTop: '2px',
      fontSize: isMobile ? '18px' : '24px', // Icono más pequeño en móvil
    },
    infoText: {
      color: '#0d47a1',
      fontSize: isMobile ? '0.85rem' : '0.95rem', // Texto más pequeño en móvil
    },
    formControl: {
      marginBottom: isMobile ? '16px' : '24px',
    },
    inputLabel: {
      fontSize: isMobile ? '0.9rem' : '1rem', // Etiqueta más pequeña en móvil
      fontWeight: '600',
      color: '#1e2a3a',
      marginBottom: isMobile ? '4px' : '8px',
    },
    helperText: {
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#637381',
      marginTop: '4px',
    },
    inputStyle: {
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      height: isMobile ? '44px' : '56px', // Input más pequeño en móvil
      fontSize: isMobile ? '0.9rem' : '1rem', // Texto de input más pequeño
    },
    submitButton: {
      backgroundColor: '#00796b',
      color: 'white',
      padding: isMobile ? '8px 16px' : '12px 24px', // Botón más pequeño en móvil
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: isMobile ? '0.85rem' : 'inherit', // Texto más pequeño en móvil
      '&:hover': {
        backgroundColor: '#00695c',
      },
    },
    cancelButton: {
      color: '#637381',
      borderColor: '#cfd8dc',
      padding: isMobile ? '8px 16px' : '12px 24px', // Botón más pequeño en móvil
      borderRadius: '8px',
      fontSize: isMobile ? '0.85rem' : 'inherit', // Texto más pequeño
    },
  };
  // State for form fields
  const [formData, setFormData] = useState({
    process_id: '',
    name: '',
    unit: '',
    lsl: '',
    usl: '',
    nominal: '',
  });

  // Handle select changes
  const handleChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación básica
    if (!formData.process_id || !formData.name || !formData.unit || !formData.lsl || !formData.usl) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Convertir valores de string a número para la API
      const requestData: CTQCreationRequest = {
        process_id: formData.process_id,
        name: formData.name,
        unit: formData.unit,
        lsl: parseFloat(formData.lsl),
        usl: parseFloat(formData.usl),
        nominal: formData.nominal ? parseFloat(formData.nominal) : undefined,
      };

      // Llamada a la API
      const response = await defineCtq(requestData);

      // Éxito: navegar a la página de detalle del CTQ
      navigate(`/ctqs/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar el CTQ');
      console.error('Error saving CTQ:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/ctqs');
  };

  return (
    <div>
      {/* Main Content */}
      <Box sx={styles.container}>
        <Paper sx={styles.paper}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={styles.pageTitle}>
            Definir Nueva CTQ
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: isMobile ? 2 : 3, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
              {error}
            </Alert>
          )}

          {processError && (
            <Alert severity="warning" sx={{ mb: isMobile ? 2 : 3, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
              Error al cargar la lista de procesos: {processError}
            </Alert>
          )}

          <Box sx={styles.infoBox}>
            <InfoOutlinedIcon sx={styles.infoIcon} fontSize={isMobile ? "small" : "medium"} />
            <Typography variant="body2" sx={styles.infoText}>
              Las Características Críticas para la Calidad (CTQ) son parámetros medibles que definen la calidad desde la perspectiva del cliente.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: isMobile ? 2 : 3 }}>
            <Box sx={styles.formControl}>
              <Typography sx={styles.inputLabel}>
                Proceso <span style={{ color: '#e53935' }}>*</span>
              </Typography>
              <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                <Select
                  id="process_id"
                  name="process_id"
                  value={formData.process_id}
                  onChange={handleChange}
                  disabled={loadingProcesses || submitting}
                  required
                  sx={{
                    backgroundColor: '#f5f7fa',
                    borderRadius: '8px',
                    height: isMobile ? '40px' : '56px',
                    fontSize: isMobile ? '0.9rem' : undefined,
                    '.MuiSelect-select': {
                      padding: isMobile ? '8px 14px' : '16px 14px',
                    },
                    // Aplicar mismo estilo de borde
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cfd8dc',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2196f3',
                      borderWidth: '1px',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        // Limitar altura del menú en móvil
                        maxHeight: isMobile ? 200 : 300,
                        // Hacer más compacto el menú en móvil
                        '& .MuiMenuItem-root': {
                          fontSize: isMobile ? '0.85rem' : undefined,
                          padding: isMobile ? '6px 14px' : '8px 16px',
                          minHeight: isMobile ? '32px' : '40px',
                          '&:active': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          }
                        },
                        '& .MuiMenu-list': {
                          paddingTop: isMobile ? 4 : 8,
                          paddingBottom: isMobile ? 4 : 8,
                        }
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {loadingProcesses ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={isMobile ? 16 : 20} sx={{ mr: 1.5 }} />
                        <Typography variant="body2" sx={{ fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                          Cargando procesos...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{
                        fontSize: isMobile ? '0.85rem' : 'inherit',
                        color: 'text.secondary'
                      }}>
                        Seleccione un proceso
                      </Typography>
                    )}
                  </MenuItem>

                  {!loadingProcesses && processes.length > 0 && processes.map((process) => (
                    <MenuItem
                      key={process.id}
                      value={process.id}
                      sx={{
                        fontSize: isMobile ? '0.85rem' : 'inherit',
                        py: isMobile ? 1 : 1.5,
                        height: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 'inherit',
                          lineHeight: isMobile ? 1.2 : 1.4,
                          // Manejo de nombres largos
                          wordBreak: 'break-word'
                        }}
                      >
                        {process.name}
                      </Typography>
                    </MenuItem>
                  ))}

                  {!loadingProcesses && processes.length === 0 && (
                    <MenuItem disabled sx={{ fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                      No hay procesos disponibles
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" sx={styles.helperText}>
                Seleccione el proceso al que pertenece esta CTQ
              </Typography>
            </Box>

            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={styles.formControl}>
                  <Typography sx={styles.inputLabel}>
                    Nombre CTQ <span style={{ color: '#e53935' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                    placeholder="Ej: Diámetro del eje"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      sx: {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9rem' : undefined,
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={styles.formControl}>
                  <Typography sx={styles.inputLabel}>
                    Unidad <span style={{ color: '#e53935' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                    placeholder="Ej: mm, cm, kg"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      sx: {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9rem' : undefined,
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={styles.formControl}>
                  <Typography sx={styles.inputLabel}>
                    Límite Inf (LSL) <span style={{ color: '#e53935' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="lsl"
                    name="lsl"
                    type="number"
                    value={formData.lsl}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                    inputProps={{
                      step: "0.01",
                      style: { fontSize: isMobile ? '0.9rem' : undefined }
                    }}
                    placeholder="Ej: 10.5"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      sx: {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9rem' : undefined,
                      }
                    }}
                  />
                  <Typography sx={styles.helperText}>
                    Límite de especificación inferior
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={styles.formControl}>
                  <Typography sx={styles.inputLabel}>
                    Límite Sup (USL) <span style={{ color: '#e53935' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="usl"
                    name="usl"
                    type="number"
                    value={formData.usl}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                    inputProps={{
                      step: "0.01",
                      style: { fontSize: isMobile ? '0.9rem' : undefined }
                    }}
                    placeholder="Ej: 12.5"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      sx: {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9rem' : undefined,
                      }
                    }}
                  />
                  <Typography sx={styles.helperText}>
                    Límite de especificación superior
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box sx={styles.formControl}>
                  <Typography sx={styles.inputLabel}>
                    Nominal (N)
                  </Typography>
                  <TextField
                    fullWidth
                    id="nominal"
                    name="nominal"
                    type="number"
                    value={formData.nominal}
                    onChange={handleInputChange}
                    disabled={submitting}
                    inputProps={{
                      step: "0.01",
                      style: { fontSize: isMobile ? '0.9rem' : undefined }
                    }}
                    placeholder="Ej: 11.5"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      sx: {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9rem' : undefined,
                      }
                    }}
                  />
                  <Typography sx={styles.helperText}>
                    Valor nominal objetivo (Opcional)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{
              mt: isMobile ? 2 : 4,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row', // Botones apilados en móvil
              gap: isMobile ? 1 : 2
            }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile} // Botón ancho completo en móvil
                startIcon={submitting ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : <SaveIcon fontSize={isMobile ? "small" : "medium"} />}
                disabled={submitting}
                sx={styles.submitButton}
              >
                {submitting ? 'Guardando...' : 'Guardar CTQ'}
              </Button>
              <Button
                variant="outlined"
                fullWidth={isMobile} // Botón ancho completo en móvil
                disabled={submitting}
                onClick={handleCancel}
                sx={styles.cancelButton}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default DefineCTQPage;