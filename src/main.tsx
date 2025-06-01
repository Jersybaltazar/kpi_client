import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Herramienta útil para dev

import App from './App';
import './index.css'; // Estilos globales básicos si los tienes

// Crear una instancia del cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cachear datos por 5 minutos
      cacheTime: 1000 * 60 * 30, // Mantener datos en caché por 30 minutos
      refetchOnWindowFocus: false, // Deshabilitar re-fetch automático al enfocar ventana (opcional)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Provider para React Query */}
    <QueryClientProvider client={queryClient}>
      {/* Provider para React Router */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* Herramientas de desarrollo para React Query (solo en dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);