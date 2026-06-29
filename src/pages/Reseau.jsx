import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography, Grid, Checkbox,
  FormGroup, FormControl, FormControlLabel, RadioGroup, Radio,
  Select, MenuItem, Alert,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import ExpandLessSharpIcon from '@mui/icons-material/ExpandLessSharp';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Navbar from '../components/Navbar';
import InteractiveMap, { getCategory } from '../components/InteractiveMap';
import { MAP_CATEGORIES } from '../components/InteractiveMap';

export default function Reseau() {
  const [pistes, setPistes]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [arrondissement, setArrondissement] = useState('all');
  const [saison, setSaison]         = useState('all');
  const [checked, setChecked]       = useState({
    rev: true, voiePartagee: true, voieProtegee: true, sentierPolyvalent: true,
  });

  useEffect(() => {
    fetch('/gti525/v1/pistes')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data => { setPistes(data); setLoading(false); })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load bike network.'); setLoading(false); });
  }, []);

  const territoires = useMemo(() => {
    if (!pistes) return [];
    return [...new Set(pistes.features.map(f => f.properties.NOM_ARR_VILLE_DESC).filter(Boolean))].sort();
  }, [pistes]);

  const filteredFeatures = useMemo(() => {
    if (!pistes) return [];
    return pistes.features.filter(f => {
      const props = f.properties;
      const cat   = getCategory(props);
      if (!cat || !checked[cat]) return false;
      if (saison !== 'all' && props.SAISONS4 !== (saison === '4' ? 'Oui' : 'Non')) return false;
      if (arrondissement !== 'all' && props.NOM_ARR_VILLE_DESC !== arrondissement) return false;
      return true;
    });
  }, [pistes, checked, saison, arrondissement]);

  const toggleCategory = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const filterMenu = (
    <FormGroup sx={{ width: '100%', mb: '1rem' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', width: '100%', textAlign: 'left' }}>
        CATÉGORIES
      </Typography>

      {MAP_CATEGORIES.map(cat => (
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar activePage="Réseau" />

      {error && <Alert severity="error" sx={{ flexShrink: 0 }}>{error}</Alert>}

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Desktop sidebar */}
        <Box sx={{ width: 280, flexShrink: 0, overflowY: 'auto', p: 2, display: { xs: 'none', md: 'block' }, borderRight: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', mb: 2 }}>Filtres</Typography>
          {filterMenu}
        </Box>

        {/* Map column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Mobile filter toggle */}
          <Box sx={{ display: { md: 'none' }, flexShrink: 0, p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Filtres</Typography>
              <Button sx={{ p: 0 }} onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ExpandLessSharpIcon /> : <ExpandMoreSharpIcon />}
              </Button>
            </Box>
            {isExpanded && <Box sx={{ pt: 1 }}>{filterMenu}</Box>}
          </Box>

          <InteractiveMap
            features={filteredFeatures}
            loading={loading}
            error={error}
          />
        </Box>
      </Box>
    </Box>
  );
}