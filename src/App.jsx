import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme';
import HomePage from './pages/HomePage';
import Statistique from './pages/Statistique';
import About from './pages/About';
import Reseau from './pages/Reseau';
import PointInteret from './pages/PointInteret';
import Assistant from './pages/Assistant';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/statistiques" element={<Statistique />} />
          <Route path="/points-interet" element={<PointInteret />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/reseau" element={<Reseau />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
