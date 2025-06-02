import React, { useEffect, useState } from 'react';
import { Alert, Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Line } from "react-chartjs-2";

interface GraficoControlProps {
  data: number[];
  results: any;
  ctq: any;
}

const GraficoControl: React.FC<GraficoControlProps> = ({ data, results, ctq }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const [error, setError] = useState<string | null>(null);

  // Validación de datos
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError("No hay datos de mediciones disponibles");
      return;
    }

    if (!results || !results.input_data) {
      setError("Los resultados del análisis no están disponibles");
      return;
    }

    if (!ctq || !ctq.specification || !ctq.specification.usl || !ctq.specification.lsl) {
      setError("Las especificaciones del CTQ no están disponibles");
      return;
    }

    setError(null);
  }, [data, results]);
  if (error) {
    return (
      <Paper
        elevation={isMobile ? 1 : 2}
        sx={{
          p: isMobile ? 1.5 : 3,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2">
          No se puede generar el gráfico de control debido a datos insuficientes.
        </Typography>
      </Paper>
    );
  }
  console.log("GraficoControl - Datos recibidos:", {
    dataLength: data?.length || 0,
    sampleValues: data?.slice(0, 5),
    mean: results?.input_data?.mean,
    stdDev: results?.input_data?.std_dev
  });

  // Calcular límites de control
  const usl = ctq.specification.usl;
  const lsl = ctq.specification.lsl;

  // Calcular puntos fuera de especificación
  const pointsOutOfSpec = data.filter(
    m => m > usl || m < lsl
  ).length;
  // Preparar datos del gráfico con estilos responsivos
  const chartData = {
    labels: data.map((_, index) => `${index + 1}`),
    datasets: [
      {
        type: 'line' as const,
        label: 'Medición',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: isMobile ? 1 : 1.5,
        pointRadius: isMobile ? (isSmallMobile ? 2 : 3) : 4,
        pointBackgroundColor: data.map(m => (
          m > usl || m < lsl
        ) ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)')
      },
      {
        type: 'line' as const,
        label: 'Media',
        data: Array(data.length).fill(results.input_data.mean),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: isMobile ? 1 : 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'USL',
        data: Array(data.length).fill(usl),
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderWidth: isMobile ? 1 : 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'LSL',
        data: Array(data.length).fill(lsl),
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderWidth: isMobile ? 1 : 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  // Opciones del gráfico optimizadas para dispositivos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        title: {
          display: true,
          text: ctq?.unit || 'Valor',
          font: {
            size: isMobile ? 11 : 14
          }
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          // Callback para formatear los ticks según el rango de datos
          callback: function (value: any) {
            const range = Math.max(...data) - Math.min(...data);
            if (range > 100) {
              return Math.round(value);
            } else if (range > 10) {
              return value.toFixed(1);
            }
            return value.toFixed(2);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Número de muestra',
          font: {
            size: isMobile ? 11 : 14
          }
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? (isSmallMobile ? 5 : 8) : 15
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: isMobile ? 'Gráfico de Control' : 'Gráfico de Control de Mediciones Individuales',
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold' as const
        },
        padding: isMobile ? 10 : 20
      },
      tooltip: {
        callbacks: {
          title: (items: any) => `Muestra #${items[0].label}`,
          label: (context: any) => {
            const dataset = context.dataset;
            const value = context.raw as number;
            // Determinar si el punto está fuera de control
            let status = '';
            if (value > usl) status = ' ⚠️ Sobre USL';
            if (value < lsl) status = ' ⚠️ Bajo LSL';

            return `${dataset.label}: ${value.toFixed(3)} ${ctq?.unit || ''}${status}`;
          }
        },
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        padding: isMobile ? 6 : 10,
        boxPadding: isMobile ? 2 : 4
      },
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12
          },
          boxWidth: isMobile ? 10 : 15,
          padding: isMobile ? 10 : 15
        }
      },
      // Añadir anotaciones para límites (opcionales)
      annotation: {
        annotations: {
          uclLine: {
            type: 'line',
            yMin: usl,
            yMax: usl,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [10, 5],
            label: {
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              content: 'UCL',
              enabled: !isSmallMobile,
              position: 'end',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          },
          lclLine: {
            type: 'line',
            yMin: lsl,
            yMax: lsl,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: isMobile ? 1 : 2,
            borderDash: [10, 5],
            label: {
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              content: 'LCL',
              enabled: !isSmallMobile,
              position: 'end',
              font: {
                size: isMobile ? 10 : 12
              }
            }
          }
        }
      }
    }
  };

  return (
    <Paper
      elevation={isMobile ? 1 : 2}
      sx={{
        p: isMobile ? 1.5 : 3,
        borderRadius: '8px',
        overflow: 'hidden'
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
        {isMobile ? "Control de Proceso" : `Gráfico de Control para ${ctq?.name || 'Mediciones'}`}
      </Typography>

      {/* Contenedor para el gráfico con altura responsiva */}
      <Box sx={{
        height: isMobile ? (isSmallMobile ? 220 : 280) : isTablet ? 350 : 400,
        position: 'relative',
        width: '100%'
      }}>
        <Line data={chartData} options={chartOptions as any} />
      </Box>

      {/* Información adicional del control estadístico */}
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
            USL: {usl.toFixed(3)} {ctq?.unit || ''} / LSL: {lsl.toFixed(3)} {ctq?.unit || ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant={isMobile ? "caption" : "body2"}
            component="span"
            sx={{
              fontWeight: 'medium',
              color: pointsOutOfSpec > 0 ? 'error.main' : 'success.main'
            }}
          >
            {pointsOutOfSpec > 0 ?
              `${pointsOutOfSpec} punto${pointsOutOfSpec > 1 ? 's' : ''} fuera de especificación` :
              'Todas las mediciones dentro de especificación'
            }
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GraficoControl;