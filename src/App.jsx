import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme';
import HomePage from './pages/HomePage';
import Statistic from './pages/Statistic';
import About from './pages/About';
import PointInteret from './pages/PointInteret';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/statistiques" element={<Statistic />} />
          <Route path="/points-interet" element={<PointInteret />} />
          <Route path="/a-propos" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
