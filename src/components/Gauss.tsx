import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface GaussianChartProps {
  data: number[];
  lsl: number;
  usl: number;
  nominal?: number;
}

const GaussianChart: React.FC<GaussianChartProps> = ({ data, lsl, usl, nominal }) => {
  // Detección de tamaño de pantalla
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');

  // Calcular la media y la desviación estándar
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const stdDev = Math.sqrt(data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length);
  
  // Calcular el nominal si no se proporciona
  const nominalValue = nominal || ((lsl + usl) / 2);

  // Generar puntos para la curva de Gauss con más o menos puntos según el dispositivo
  const generateGaussianData = () => {
    const points = [];
    // Ajustar la cantidad de puntos según el dispositivo
    const pointCount = isMobile ? 40 : 100;
    const step = (usl - lsl) / pointCount;
    
    // Extender el rango un poco más allá de los límites
    const rangeExtension = stdDev * 3;
    for (let x = Math.min(lsl, mean - rangeExtension); x <= Math.max(usl, mean + rangeExtension); x += step) {
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      points.push({ x, y });
    }
    return points;
  };

  const gaussianData = generateGaussianData();

  // Calcular áreas fuera de especificación
  const calculateOutOfSpec = () => {
    // Función para la distribución normal acumulativa (aproximación)
    const normalCdf = (z: number): number => {
      return 0.5 * (1 + erf(z / Math.sqrt(2)));
    };
    
    // Función de error (aproximación)
    const erf = (x: number): number => {
      const a1 =  0.254829592;
      const a2 = -0.284496736;
      const a3 =  1.421413741;
      const a4 = -1.453152027;
      const a5 =  1.061405429;
      const p  =  0.3275911;
      
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x);
      
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      
      return sign * y;
    };
    
    // Calcular Z-scores
    const zLower = (lsl - mean) / stdDev;
    const zUpper = (usl - mean) / stdDev;
    
    // Probabilidades acumulativas
    const pLower = normalCdf(zLower);
    const pUpper = 1 - normalCdf(zUpper);
    
    // Porcentajes fuera de especificación
    return {
      lower: Math.round(pLower * 100 * 1000) / 1000, // % bajo el LSL, 3 decimales
      upper: Math.round(pUpper * 100 * 1000) / 1000, // % sobre el USL, 3 decimales
      total: Math.round((pLower + pUpper) * 100 * 1000) / 1000 // % total fuera de esp
    };
  };

  const outOfSpec = calculateOutOfSpec();

  // Crear datasets para áreas fuera de especificación
  const createAreaDatasets = () => {
    // Crear dataset para área bajo LSL (rojo)
    const lslArea = gaussianData
      .filter(point => point.x <= lsl)
      .map(point => ({ x: point.x, y: point.y }));
    
    // Crear dataset para área sobre USL (rojo)
    const uslArea = gaussianData
      .filter(point => point.x >= usl)
      .map(point => ({ x: point.x, y: point.y }));
    
    // Crear dataset para el área conforme (verde)
    const conformArea = gaussianData
      .filter(point => point.x >= lsl && point.x <= usl)
      .map(point => ({ x: point.x, y: point.y }));
    
    return [
      {
        label: 'Bajo LSL',
        data: lslArea,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        borderWidth: isMobile ? 1 : 2,
        fill: true,
        pointRadius: 0,
      },
      {
        label: 'Sobre USL',
        data: uslArea,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        borderWidth: isMobile ? 1 : 2,
        fill: true,
        pointRadius: 0,
      },
      {
        label: 'Dentro de Especificación',
        data: conformArea,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.3)',
        borderWidth: isMobile ? 1 : 2,
        fill: true,
        pointRadius: 0,
      }
    ];
  };

  // Preparar datos para Chart.js
  const chartData = {
    datasets: [
      ...createAreaDatasets(),
      {
        label: 'Distribución Normal',
        data: gaussianData,
        borderColor: 'rgba(0, 0, 0, 0.7)',
        borderWidth: isMobile ? 1 : 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        tension: 0.4,
      }
    ],
  };

  // Opciones del gráfico optimizadas para diferentes dispositivos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: {
      xAxisKey: 'x',
      yAxisKey: 'y'
    },
    plugins: {
      legend: {
        display: !isSmallMobile,
        position: 'top' as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12
          },
          boxWidth: isMobile ? 10 : 15,
          padding: isMobile ? 5 : 10
        }
      },
      title: {
        display: true,
        text: isMobile ? 'Distribución Normal' : 'Campana de Gauss - Distribución Normal',
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold'
        },
        padding: isMobile ? 5 : 10
      },
      tooltip: {
        // Tooltip más compacto en móvil
        titleFont: {
          size: isMobile ? 11 : 14,
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
        },
        callbacks: {
          title: function(tooltipItems: any[]) {
            return `Valor: ${Number(tooltipItems[0].parsed.x).toFixed(2)}`;
          },
          label: function(tooltipItem: any) {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.parsed.y;
            return `${datasetLabel}: ${value.toFixed(4)}`;
          }
        }
      },
      annotation: {
        annotations: {
          lslLine: {
            type: 'line',
            xMin: lsl,
            xMax: lsl,
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [5, 5],
            label: {
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              content: 'LSL',
              enabled: !isSmallMobile,
              position: 'top',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          },
          uslLine: {
            type: 'line',
            xMin: usl,
            xMax: usl,
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [5, 5],
            label: {
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              content: 'USL',
              enabled: !isSmallMobile,
              position: 'top',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          },
          meanLine: {
            type: 'line',
            xMin: mean,
            xMax: mean,
            borderColor: 'rgba(0, 0, 255, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [2, 2],
            label: {
              backgroundColor: 'rgba(0, 0, 255, 0.8)',
              content: 'μ',
              enabled: !isSmallMobile,
              position: 'top',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          },
          nominalLine: {
            type: 'line',
            xMin: nominalValue,
            xMax: nominalValue,
            borderColor: 'rgba(0, 128, 0, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [10, 5],
            label: {
              backgroundColor: 'rgba(0, 128, 0, 0.8)',
              content: 'Nominal',
              enabled: !isSmallMobile && nominal !== undefined,
              position: 'top',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Valores',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11
          },
          // Limitar ticks en móvil
          maxTicksLimit: isMobile ? 5 : 10,
          // Ajustar formato según el rango
          callback: function(value: any) {
            const range = usl - lsl;
            if (range > 100) {
              return Math.round(value);
            } else if (range > 10) {
              return value.toFixed(1);
            }
            return value.toFixed(2);
          }
        }
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Densidad',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11
          },
          // Limitar ticks en móvil
          maxTicksLimit: isMobile ? 4 : 8,
        },
        beginAtZero: true
      }
    }
  };

  return (
    <Paper 
      elevation={isMobile ? 1 : 2} 
      sx={{ 
        p: isMobile ? 1.5 : 3, 
        borderRadius: '8px'
      }}
    >
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        align="center" 
        gutterBottom
        sx={{
          fontWeight: 'bold',
          fontSize: isMobile ? '0.95rem' : 'inherit',
          mb: isMobile ? 1 : 2,
        }}
      >
        {isMobile ? "Distribución Normal" : "Distribución Normal - Curva de Gauss"}
      </Typography>

      {/* Contenedor para el gráfico con altura responsiva */}
      <Box sx={{ 
        height: isMobile ? (isSmallMobile ? 220 : 280) : isTablet ? 350 : 400, 
        position: 'relative',
        width: '100%'
      }}>
        <Line data={chartData} options={chartOptions} />
      </Box>

      {/* Información adicional - Solo visible en pantallas no móviles o como resumen en móviles */}
      <Box sx={{ 
        mt: isMobile ? 1 : 2,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        fontSize: isMobile ? '0.8rem' : '0.9rem'
      }}>
        <Box sx={{ mb: isMobile ? 0.5 : 0 }}>
          <Typography variant={isMobile ? "caption" : "body2"} component="span">
            μ = {mean.toFixed(3)}, σ = {stdDev.toFixed(3)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 0.5 : 2 
        }}>
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            component="span" 
            sx={{ 
              color: 'error.main' 
            }}
          >
            Fuera LSL: {outOfSpec.lower}%
          </Typography>
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            component="span"
            sx={{ 
              color: 'error.main' 
            }}
          >
            Fuera USL: {outOfSpec.upper}%
          </Typography>
          <Typography 
            variant={isMobile ? "caption" : "body2"}
            component="span" 
            sx={{ 
              fontWeight: 'bold',
              color: outOfSpec.total > 1 ? 'error.main' : 'success.main'
            }}
          >
            Total fuera: {outOfSpec.total}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GaussianChart;