import React from 'react';
import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js'; 

interface CapabilityChartProps {
  mean: number;
  stdDev: number;
  usl: number;
  lsl: number;
  nominal?: number | null;
}

// Función para calcular la PDF Normal
const normalPDF = (x: number, mean: number, stdDev: number): number => {
    if (stdDev <= 0) return 0;
    const exponent = -((x - mean) ** 2) / (2 * stdDev ** 2);
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    return coefficient * Math.exp(exponent);
};

const CapabilityChart: React.FC<CapabilityChartProps> = ({ mean, stdDev, usl, lsl, nominal }) => {
  // 1. Generar datos para la curva normal
  const plotPoints = 200;
  const range = 4 * stdDev; // Graficar +/- 4 desviaciones estándar
  const xMin = mean - range;
  const xMax = mean + range;
  const xValues: number[] = [];
  const pdfValues: number[] = [];
  const step = (xMax - xMin) / plotPoints;

  for (let i = 0; i <= plotPoints; i++) {
    const x = xMin + i * step;
    xValues.push(x);
    pdfValues.push(normalPDF(x, mean, stdDev));
  }

  // 2. Definir el trace de la curva
  const curveTrace = {
    x: xValues,
    y: pdfValues,
    type: 'scatter' as const, // Asegurar tipo para Plotly
    mode: 'lines' as const,
    name: 'Distribución del Proceso',
    line: { color: 'blue' },
    fill: 'tozeroy' as const, // Rellenar área bajo la curva
    fillcolor: 'rgba(0, 0, 255, 0.1)',
  };

  // 3. Definir layout con líneas de especificación y media
  const layout: Partial<Layout> = { // Usar Partial<Layout> para tipado parcial
    title: 'Distribución del Proceso vs Especificaciones',
    xaxis: { title: 'Valor de la Característica' },
    yaxis: { title: 'Densidad de Probabilidad' },
    shapes: [
      // LSL
      { type: 'line', x0: lsl, y0: 0, x1: lsl, y1: Math.max(...pdfValues) * 1.1, line: { color: 'red', width: 2, dash: 'dash' }, name: 'LSL' },
      // USL
      { type: 'line', x0: usl, y0: 0, x1: usl, y1: Math.max(...pdfValues) * 1.1, line: { color: 'red', width: 2, dash: 'dash' }, name: 'USL' },
      // Media (μ)
      { type: 'line', x0: mean, y0: 0, x1: mean, y1: Math.max(...pdfValues) * 1.1, line: { color: 'green', width: 2, dash: 'dot' }, name: 'Media (μ)' },
    ],
    showlegend: true,
     legend: {
        yanchor: "top", y: 0.99,
        xanchor: "left", x: 0.01
    },
    margin: { l: 50, r: 50, t: 50, b: 50 }, // Ajustar márgenes
    autosize: true, // Hacer que el gráfico se ajuste al contenedor
  };

  // Añadir línea Nominal si existe
  if (nominal !== undefined && nominal !== null) {
    layout.shapes?.push(
      { type: 'line', x0: nominal, y0: 0, x1: nominal, y1: Math.max(...pdfValues) * 1.1, line: { color: 'orange', width: 2, dash: 'longdash' }, name: 'Nominal (N)' }
    );
  }

   // Añadir anotaciones para las líneas (alternativa a la leyenda de shapes)
   layout.annotations = [
       { x: lsl, y: Math.max(...pdfValues) * 1.05, text: 'LSL', showarrow: false, xanchor: 'center' },
       { x: usl, y: Math.max(...pdfValues) * 1.05, text: 'USL', showarrow: false, xanchor: 'center' },
       { x: mean, y: Math.max(...pdfValues) * 1.05, text: 'μ', showarrow: false, xanchor: 'center' },
   ];
   if (nominal !== undefined && nominal !== null) {
       layout.annotations.push({ x: nominal, y: Math.max(...pdfValues) * 1.05, text: 'N', showarrow: false, xanchor: 'center' });
   }


  return (
    <Plot
      data={[curveTrace]}
      layout={layout}
      useResizeHandler={true} // Permitir que el gráfico se redimensione con la ventana/contenedor
      style={{ width: '100%', height: '100%' }} // Ajustar al tamaño del contenedor padre
      config={{ responsive: true }} // Configuración adicional de responsividad
    />
  );
};

export default CapabilityChart;