import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Container, Typography, Grid, Checkbox,
  FormGroup, FormControl, FormControlLabel, RadioGroup, Radio,
  Select, MenuItem, Paper, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import ExpandLessSharpIcon from '@mui/icons-material/ExpandLessSharp';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Category classification ───────────────────────────────────────────────

const CATEGORY_COLORS = {
  rev:               '#2AC7DD',
  voiePartagee:      '#84CA4B',
  voieProtegee:      '#025D29',
  sentierPolyvalent: '#B958D9',
};

const CATEGORIES = [
  {
    key: 'rev',
    label: 'REV',
    color: '#2AC7DD',
    description: 'Réseau Express Vélo — REV_AVANCEMENT_CODE ∈ {EV, PE, TR}',
  },
  {
    key: 'voiePartagee',
    label: 'Voie partagée',
    color: '#84CA4B',
    description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE ∈ {1, 3, 8, 9}',
  },
  {
    key: 'voieProtegee',
    label: 'Voie protégée',
    color: '#025D29',
    description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE ∈ {4, 5, 6}',
  },
  {
    key: 'sentierPolyvalent',
    label: 'Sentier polyvalent',
    color: '#B958D9',
    description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE = 7',
  },
];

function getCategory(props) {
  const rev      = props.REV_AVANCEMENT_CODE;
  const avance   = props.AVANCEMENT_CODE;
  const typeVoie = parseInt(props.TYPE_VOIE_CODE, 10);

  if (['EV', 'PE', 'TR'].includes(rev)) return 'rev';
  if (avance === 'E') {
    if ([1, 3, 8, 9].includes(typeVoie)) return 'voiePartagee';
    if ([4, 5, 6].includes(typeVoie))    return 'voieProtegee';
    if (typeVoie === 7)                  return 'sentierPolyvalent';
  }
  return null;
}

function styleFeature(feature) {
  return {
    color:   CATEGORY_COLORS[getCategory(feature.properties)] ?? '#999999',
    weight:  3,
    opacity: 0.85,
  };
}

// ─── Component ────────────────────────────────────────────────────────────

export default function Reseau() {
  const [pistes, setPistes]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [arrondissement, setArrondissement] = useState('all');
  const [saison, setSaison]       = useState('all');
  const [checked, setChecked]     = useState({
    rev: true, voiePartagee: true, voieProtegee: true, sentierPolyvalent: true,
  });

  useEffect(() => {
    fetch('/gti525/v1/pistes')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data  => { setPistes(data); setLoading(false); })
      .catch(err  => { setError(typeof err === 'string' ? err : 'Failed to load bike network.'); setLoading(false); });
  }, []);

  const territoires = useMemo(() => {
    if (!pistes) return [];
    return [...new Set(pistes.features.map(f => f.properties.ARRONDISSEMENT).filter(Boolean))].sort();
  }, [pistes]);

  const filteredFeatures = useMemo(() => {
    if (!pistes) return [];
    return pistes.features.filter(f => {
      const props = f.properties;
      const cat   = getCategory(props);
      if (!cat || !checked[cat]) return false;
      if (saison !== 'all' && parseInt(props.SAISON_PISTE, 10) !== parseInt(saison, 10)) return false;
      if (arrondissement !== 'all' && props.ARRONDISSEMENT !== arrondissement) return false;
      return true;
    });
  }, [pistes, checked, saison, arrondissement]);

  const filteredGeoJson = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredFeatures,
  }), [filteredFeatures]);

  const totalKm = useMemo(
    () => filteredFeatures.reduce((sum, f) => sum + (f.properties.LONGUEUR || 0), 0).toFixed(1),
    [filteredFeatures],
  );

  // Key forces GeoJSON layer remount when filters change
  const geoJsonKey = Object.values(checked).join('') + saison + arrondissement;

  const toggleCategory = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Filter panel (shared between desktop sidebar and mobile drawer) ──────

  const filterMenu = (
    <FormGroup sx={{ width: '100%', mb: '1rem' }}>

      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', width: '100%', textAlign: 'left' }}>
        CATÉGORIES
      </Typography>

      {CATEGORIES.map(cat => (
        <FormControlLabel
          key={cat.key}
          control={<Checkbox checked={checked[cat.key]} onChange={() => toggleCategory(cat.key)} />}
          label={
            <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircleIcon sx={{ color: cat.color, fontSize: 18 }} />
              <Typography>{cat.label}</Typography>
            </Grid>
          }
          sx={{ width: '100%' }}
        />
      ))}

      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', mt: 4, width: '100%', textAlign: 'left' }}>
        SAISON
      </Typography>

      <RadioGroup value={saison} onChange={e => setSaison(e.target.value)} sx={{ width: '100%' }}>
        <FormControlLabel value="all" control={<Radio />} label="Toutes les pistes" />
        <FormControlLabel value="4"   control={<Radio />} label="4 saisons" />
        <FormControlLabel value="3"   control={<Radio />} label="3 saisons" />
      </RadioGroup>

      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', mt: 4, mb: 1, width: '100%', textAlign: 'left' }}>
        ARRONDISSEMENT
      </Typography>

      <FormControl sx={{ width: '100%' }}>
        <Select value={arrondissement} sx={{ textAlign: 'left' }} onChange={e => setArrondissement(e.target.value)} variant="outlined">
          <MenuItem value="all">Tous</MenuItem>
          {territoires.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>

      <Box sx={{ backgroundColor: '#8cc5984f', mt: 4, p: 2, borderRadius: 4, width: '100%' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', textAlign: 'left' }}>PISTES POPULAIRES</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DatePicker label="De" format="DD-MM-YYYY" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DatePicker label="À"  format="DD-MM-YYYY" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
          </Box>
        </LocalizationProvider>
        <Button variant="contained" size="small" sx={{ width: '100%', justifyContent: 'flex-start', mb: 1, mt: 1 }}>Mettre en surbrillance</Button>
        <Button variant="outlined"  size="small" sx={{ width: '100%', justifyContent: 'flex-start', mb: 1, backgroundColor: '#ffffff', borderWidth: 2 }}>Réinitialiser</Button>
      </Box>
    </FormGroup>
  );

  // ── Interactive map ───────────────────────────────────────────────────────

  const interactiveMap = (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)' }}>
          <CircularProgress />
        </Box>
      )}

      <MapContainer center={[45.5017, -73.5673]} zoom={10} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {!loading && !error && (
          <GeoJSON key={geoJsonKey} data={filteredGeoJson} style={styleFeature} />
        )}
      </MapContainer>

      {/* Help icon */}
      <IconButton
        onClick={() => setLegendOpen(true)}
        sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, bgcolor: '#ffffff', '&:hover': { bgcolor: '#f5f5f5' } }}
        size="small"
      >
        <InfoOutlinedIcon />
      </IconButton>

      {/* Summary panel */}
      <Paper sx={{ position: 'absolute', bgcolor: '#ffffff', zIndex: 1000, bottom: 25, right: 10, display: 'flex', alignItems: 'center', p: 1, gap: 0.5 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{filteredFeatures.length}</Typography>
        <Typography sx={{ fontSize: 15 }}>pistes affichées,</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{totalKm}</Typography>
        <Typography sx={{ fontSize: 15 }}>km</Typography>
      </Paper>
    </Box>
  );

  // ── Legend modal ──────────────────────────────────────────────────────────

  const legendDialog = (
    <Dialog open={legendOpen} onClose={() => setLegendOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6, color: '#000000' }}>
        Légende des catégories
        <IconButton onClick={() => setLegendOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {CATEGORIES.map(cat => (
          <Box key={cat.key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <CircleIcon sx={{ color: cat.color, mt: 0.3, flexShrink: 0 }} />
            <Box>
              <Typography fontWeight={700}>{cat.label}</Typography>
              <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <header>
        <Navbar activePage="Réseau" />
      </header>

      <main>
        {error && (
          <Container maxWidth="lg">
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          </Container>
        )}

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 0.1 } }}>
          <Box component="section" sx={{ py: { xs: 4, md: 3 }, backgroundColor: '#ffffff' }}>
            <Container maxWidth="lg">
              <Grid container spacing={2}>

                {/* Desktop sidebar */}
                <Grid size={{ xs: 0, md: 4 }} sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', mb: 3 }}>Filtres</Typography>
                  {filterMenu}
                </Grid>

                {/* Map + mobile filters */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ display: { md: 'none' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', mb: 3, textAlign: 'left' }}>Filtres</Typography>
                      <Button sx={{ p: 0, mb: 3 }} onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ExpandLessSharpIcon /> : <ExpandMoreSharpIcon />}
                      </Button>
                    </Box>
                    {isExpanded && filterMenu}
                  </Box>
                  {interactiveMap}
                </Grid>

              </Grid>
            </Container>
          </Box>
        </Container>
      </main>

      {legendDialog}

      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider', backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MTL Vélo — Données ouvertes Ville de Montréal
          </Typography>
        </Container>
      </Box>
    </>
  );
}
