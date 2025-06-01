import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';

import theme from './styles/theme';
import Layout from './components/Layout'; // El layout principal

// Importar componentes de página (Placeholders por ahora)
import HomePage from './pages/HomePage';
import DefineCtqPage from './pages/DefineCtqPage';
import CtqListPage from './pages/CtqListPage';
import CtqDetailPage from './pages/CtqDetailPage';
import NewStudyPage from './pages/NewStudyPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/ctqs" element={<CtqListPage />} />
          <Route path="/ctqs/new" element={<DefineCtqPage />} />
          <Route path="/ctqs/:ctqId" element={<CtqDetailPage />} />

          <Route path="/studies/new/:ctqId" element={<NewStudyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;