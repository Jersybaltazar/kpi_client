import React from 'react';
import { Box, Typography, Paper, Grid, Chip, useTheme, useMediaQuery } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface CapabilityHistogramProps {
  data: {
    raw_measurements: number[];
    mean: number;
    std_dev: number;
    sample_size: number;
    cp: number;
    cpk: number;
    histogram: {
      bins: number[];
      counts: number[];
    };
    specification: {
      lsl: number;
      usl: number;
      nominal: number;
    };
    unit: string;
    ctq_name: string;
  };
}

const CapabilityHistogram: React.FC<CapabilityHistogramProps> = ({ data }) => {
  // Agregar detección de tamaño de pantalla
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');

  // Calcular estadísticas adicionales
  const calculateStats = () => {
    const { mean, std_dev, specification, cp, cpk } = data;
    const { lsl, usl, nominal } = specification;

    // Nivel Z
    const zLower = (mean - lsl) / std_dev;
    const zUpper = (usl - mean) / std_dev;
    const zLevel = Math.min(Math.abs(zLower), Math.abs(zUpper));

    // Porcentaje fuera de especificación
    const ppmLower = Math.max(0, (1 - normalCdf(zLower)) * 1000000);
    const ppmUpper = Math.max(0, normalCdf(-zUpper) * 1000000);
    const totalPpm = ppmLower + ppmUpper;

    return {
      zLevel: zLevel.toFixed(2),
      ppmTotal: Math.round(totalPpm),
      ppmLower: Math.round(ppmLower),
      ppmUpper: Math.round(ppmUpper)
    };
  };

  // Función CDF normal estándar (aproximación)
  const normalCdf = (z: number): number => {
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  // Función error (aproximación)
  const erf = (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  // Generar datos para la curva normal
  // Generar datos para la curva normal
  const generateNormalCurve = (mean: number, stdDev: number, min: number, max: number, points: number = 100) => {
    const step = (max - min) / points;
    const curve = [];

    for (let i = 0; i <= points; i++) {
      const x = min + i * step;
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      curve.push({ x, y });
    }

    return curve;
  };

  const { mean, std_dev, specification = { lsl: 0, usl: 0, nominal: 0 }, histogram, unit, ctq_name } = data;
  const lsl = specification.lsl;
  const usl = specification.usl;
  const nominal = specification.nominal || (lsl + usl) / 2;

  // Calcular rango para el gráfico
  const dataRange = Math.max(usl - lsl, 6 * std_dev);
  const chartMin = Math.min(lsl, mean - 3 * std_dev);
  const chartMax = Math.max(usl, mean + 3 * std_dev);

  // Generar curva normal
  const normalCurve = generateNormalCurve(mean, std_dev, chartMin, chartMax);
  // Añadir después de generar normalCurve:

  // Generar curva de capacidad potencial (centrada en el nominal)
  const potentialCurve = generateNormalCurve(nominal, std_dev, chartMin, chartMax);
  // Escalar la curva normal para que se ajuste al histograma
  const maxCount = Math.max(...histogram.counts);
  const scaleFactor = maxCount / Math.max(...normalCurve.map(p => p.y));

  const stats = calculateStats();

  // Preparar datos del gráfico
  const chartData = {
    datasets: [
      // Área sombreada bajo LSL
      {
        type: 'line' as const,
        label: 'Fuera LSL',
        data: normalCurve
          .filter(p => p.x < lsl)
          .map(p => ({ x: p.x, y: p.y * scaleFactor })),
        borderColor: 'rgba(255, 0, 0, 0.0)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: true,
        pointRadius: 0,
        yAxisID: 'y',
        order: 3,
        hidden: false,  
        showInLegendDisplay: false  // No mostrar en la leyenda
      },

      // Área sombreada sobre USL
      {
        type: 'line' as const,
        label: 'Fuera USL',
        data: normalCurve
          .filter(p => p.x > usl)
          .map(p => ({ x: p.x, y: p.y * scaleFactor })),
        borderColor: 'rgba(255, 0, 0, 0.0)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: true,
        pointRadius: 0,
        yAxisID: 'y',
        order: 3,
        showInLegendDisplay: false  // No mostrar en la leyenda
      },

      // SOLO UN histograma de barras - eliminar duplicados
      {
        type: 'bar' as const,
        label: 'Frecuencia',
        // Modificar la estructura de datos para barras usando formato x-y para puntos individuales
        data: histogram.bins.slice(0, -1).map((bin, i) => ({
          x: (bin + histogram.bins[i + 1]) / 2, // Punto medio del bin
          y: histogram.counts[i] // Altura (frecuencia)
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        barPercentage: 0.95, // Hacer las barras más anchas
        categoryPercentage: 0.95, // Reducir el espacio entre barras
        yAxisID: 'y',
        order: 1
      },

      // SOLO UNA curva normal
      {
        type: 'line' as const,
        label: 'Curva Normal',
        data: normalCurve.map(p => ({ x: p.x, y: p.y * scaleFactor })),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        yAxisID: 'y',
        order: 2
      },
      // Dataset para la curva de capacidad potencial
      {
        type: 'line' as const,
        label: 'Capacidad Potencial',
        data: potentialCurve.map(p => ({ x: p.x, y: p.y * scaleFactor })),
        borderColor: 'rgba(128, 128, 128, 0.7)', // Color gris
        borderWidth: 1.5,
        borderDash: [3, 3], // Línea punteada
        fill: false,
        pointRadius: 0,
        yAxisID: 'y',
        order: 4
      }
    ]
  };

  // Opciones de gráfico optimizadas para dispositivos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          // Fuentes más pequeñas en móvil
          font: {
            size: isMobile ? 10 : 12,
          },
          boxWidth: isMobile ? 12 : 15,
        },
      },
      title: {
        display: true,
        text: isMobile ? `Capacidad - ${ctq_name}` : `Histograma de Capacidad - ${ctq_name}`,
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        // Tooltip más compacto en móvil
        titleFont: {
          size: isMobile ? 11 : 14,
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
        },
        padding: isMobile ? 6 : 10,
      },
      annotation: {
        annotations: {
          lsl: {
            type: 'line',
            scaleID: 'x',
            value: lsl,
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [5, 5],
            label: {
              content: 'LSL',
              enabled: !isSmallMobile, // Ocultar etiquetas en pantallas muy pequeñas
              position: 'top',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          usl: {
            type: 'line',
            scaleID: 'x',
            value: usl,
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [5, 5],
            label: {
              content: 'USL',
              enabled: !isSmallMobile,
              position: 'top',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          nominal: {
            type: 'line',
            scaleID: 'x',
            value: nominal,
            borderColor: 'rgba(0, 128, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [10, 5],
            label: {
              content: 'Nominal',
              enabled: !isSmallMobile,
              position: 'top',
              backgroundColor: 'rgba(0, 128, 0, 0.8)',
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          mean: {
            type: 'line',
            scaleID: 'x',
            value: mean,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [3, 3],
            label: {
              content: 'Media',
              enabled: !isSmallMobile,
              position: 'top',
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        min: chartMin,
        max: chartMax,
        title: {
          display: true,
          text: unit,
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
          },
          // Limitar número de ticks en móvil
          maxTicksLimit: isMobile ? 5 : 10,
          // Ajustar precisión de los números según el rango
          callback: function (value: any) {
            const range = chartMax - chartMin;
            if (range > 100) {
              return Math.round(value);
            } else if (range > 10) {
              return value.toFixed(1);
            }
            return value.toFixed(2);
          }
        },
        offset: false,
        grid: {
          offset: false
        }
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Frecuencia',
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
          },
          // Limitar número de ticks en móvil
          maxTicksLimit: isMobile ? 5 : 8,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper elevation={2} sx={{
      p: isMobile ? 1.5 : isTablet ? 2 : 3,
      borderRadius: '8px',
    }}>
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        gutterBottom
        align="center"
        sx={{
          fontWeight: 'bold',
          fontSize: isMobile ? '0.95rem' : 'inherit',
          mb: isMobile ? 1 : 1.5,
        }}
      >
        {isMobile ? `Capacidad: ${ctq_name}` : `Análisis de Capacidad para ${ctq_name}`}
      </Typography>

      <Grid container spacing={isMobile ? 1.5 : 3}>
        {/* Gráfico principal - ajustado para responsividad */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{
            height: isMobile ? (isSmallMobile ? 220 : 280) : isTablet ? 350 : 400,
            position: 'relative',
            width: '100%',
          }}>
            <Chart
              type="scatter"
              data={chartData}
              options={chartOptions as any} />
          </Box>
        </Grid>

        {/* Panel de estadísticas - versión mobile vs desktop */}
        <Grid size={{ xs: 12, md: 4 }}>
          {isMobile ? (
            // Versión móvil: diseño compacto en acordeones
            <Box>
              {/* Resumen compacto de datos clave */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  bgcolor: '#f5f8fa',
                  borderRadius: '8px',
                }}
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }} >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                        }}
                      >
                        Cp/Cpk
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {data.cp.toFixed(2)} / {data.cpk.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }} >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                        }}
                      >
                        Nivel Z / PPM
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {stats.zLevel}σ / {stats.ppmTotal.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }} >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                        }}
                      >
                        LSL / USL
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {lsl} / {usl}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }} >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                        }}
                      >
                        Media / Desv.
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {mean.toFixed(2)} / {std_dev.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Chips de interpretación - versión compacta */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.8,
                mb: 1
              }}>
                <Chip
                  label={`Cp: ${data.cp >= 1.33 ? 'Adec.' : data.cp >= 1.0 ? 'Marg.' : 'Inad.'}`}
                  color={data.cp >= 1.33 ? 'success' : data.cp >= 1.0 ? 'warning' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                    height: isSmallMobile ? '22px' : '24px',
                  }}
                />
                <Chip
                  label={`Cpk: ${data.cpk >= 1.33 ? 'Cent.' : data.cpk >= 1.0 ? 'Acept.' : 'Desc.'}`}
                  color={data.cpk >= 1.33 ? 'success' : data.cpk >= 1.0 ? 'warning' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                    height: isSmallMobile ? '22px' : '24px',
                  }}
                />
                <Chip
                  label={`PPM: ${stats.ppmTotal < 1000 ? 'Excel.' : stats.ppmTotal < 10000 ? 'Bueno' : 'Mejorar'}`}
                  color={stats.ppmTotal < 1000 ? 'success' : stats.ppmTotal < 10000 ? 'warning' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                    height: isSmallMobile ? '22px' : '24px',
                  }}
                />
              </Box>
            </Box>
          ) : (
            // Versión desktop: paneles detallados
            <>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Caracterización del proceso
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">N Total</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {data.sample_size}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Tamaño del subgrupo</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      1
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Media</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {mean.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Desv. estándar</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {std_dev.toFixed(4)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Estadísticos de capacidad
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Cp</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {data.cp.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Cpk</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {data.cpk.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Nivel Z</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {stats.zLevel}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">PPM Total</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {stats.ppmTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Límites de especificación
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">LSL</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {lsl}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">USL</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {usl}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} >
                    <Typography variant="body2">Nominal</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {nominal}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </Grid>
      </Grid>

      {/* Interpretación - adaptativa */}
      {!isMobile && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Interpretación del Proceso
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Chip
                label={`Cp: ${data.cp >= 1.33 ? 'Adecuado' : data.cp >= 1.0 ? 'Marginal' : 'Inadecuado'}`}
                color={data.cp >= 1.33 ? 'success' : data.cp >= 1.0 ? 'warning' : 'error'}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Chip
                label={`Cpk: ${data.cpk >= 1.33 ? 'Centrado' : data.cpk >= 1.0 ? 'Aceptable' : 'Descentrado'}`}
                color={data.cpk >= 1.33 ? 'success' : data.cpk >= 1.0 ? 'warning' : 'error'}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Chip
                label={`PPM: ${stats.ppmTotal < 1000 ? 'Excelente' : stats.ppmTotal < 10000 ? 'Bueno' : 'Requiere mejora'}`}
                color={stats.ppmTotal < 1000 ? 'success' : stats.ppmTotal < 10000 ? 'warning' : 'error'}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Chip
                label={`Sigma: ${parseFloat(stats.zLevel) >= 4 ? 'Alto' : parseFloat(stats.zLevel) >= 3 ? 'Medio' : 'Bajo'}`}
                color={parseFloat(stats.zLevel) >= 4 ? 'success' : parseFloat(stats.zLevel) >= 3 ? 'warning' : 'error'}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default CapabilityHistogram;