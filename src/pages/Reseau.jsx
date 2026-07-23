import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography, Grid, Checkbox,
  FormGroup, FormControl, FormControlLabel, RadioGroup, Radio,
  Select, MenuItem, Alert,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import ExpandLessSharpIcon from '@mui/icons-material/ExpandLessSharp';
import MapIcon from '@mui/icons-material/Map';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Navbar from '../components/Navbar';
import ArrondissementMapDialog from '../components/ArrondissementMapDialog';
import useTerritoires from '../lib/useTerritoires';
import { normArr, arrOptionsFrom, ALL } from '../lib/arrondissement';
import InteractiveMap, { getCategory, MAP_CATEGORIES } from '../components/InteractiveMap';
import {obtenirPistesPopulaires} from "../api/client.js";

export default function Reseau() {
  const [pistes, setPistes]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [arrondissement, setArrondissement] = useState(ALL);
  const [arrMapOpen, setArrMapOpen] = useState(false);
  const territoires = useTerritoires();
  const [saison, setSaison]         = useState('all');
  const [checked, setChecked]       = useState({
    rev: true, voiePartagee: true, voieProtegee: true, sentierPolyvalent: true,
  });
  const [dateDebut, setDateDebut]         = useState(null);
  const [dateFin, setDateFin]         = useState(null);


  useEffect(() => {
    fetch('/gti525/v1/pistes')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.message)))
      .then(body => { setPistes(body.data); setLoading(false); })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load bike network.'); setLoading(false); });
  }, []);

  const arrOptions = useMemo(() => arrOptionsFrom(territoires), [territoires]);

  const filteredFeatures = useMemo(() => {
    if (!pistes) return [];
    const selArr = arrondissement === ALL ? null : normArr(arrondissement);
    return pistes.features.filter(f => {
      const props = f.properties;
      const cat   = getCategory(props);
      if (!cat || !checked[cat]) return false;
      if (saison !== 'all' && props.SAISONS4 !== (saison === '4' ? 'Oui' : 'Non')) return false;
      if (selArr && normArr(props.NOM_ARR_VILLE_DESC) !== selArr) return false;
      return true;
    });
  }, [pistes, checked, saison, arrondissement]);

  // Selected borough boundary, drawn highlighted over the pistes on the main map.
  const selectedArrFeature = useMemo(() => {
    if (arrondissement === ALL || !territoires) return null;
    const target = normArr(arrondissement);
    return territoires.features.find(f => normArr(f.properties.NOM) === target) || null;
  }, [arrondissement, territoires]);

  const toggleCategory = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

    async function highlightMostPopular() {
        const payload = {
            populaireDebut: changeDateFormat(dateDebut),
            populaireFin: changeDateFormat(dateFin),
        };

        try {
            const response = await obtenirPistesPopulaires(payload);

            if (!response.ok) {
                throw new Error(response.donnees?.erreur || response.erreur || "Erreur.");
            }

            setPistes(response.donnees.data);
        } catch (e) {
            alert(e.message);
        }
    }

  function changeDateFormat(input){
        const date = new Date(input);

        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
  }

  async function reinitialiserPistePopulaire(){
      setDateDebut(null);
      setDateFin(null);
      await fetch('/gti525/v1/pistes')
          .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.message)))
          .then(body => { setPistes(body.data); setLoading(false); })
          .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load bike network.'); setLoading(false); });

  }

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
          <MenuItem value={ALL}>Tous</MenuItem>
          {arrOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        size="small"
        startIcon={<MapIcon />}
        onClick={() => setArrMapOpen(true)}
        disabled={!territoires}
        sx={{ mt: 1, width: '100%', backgroundColor: '#ffffff', borderWidth: 2 }}
      >
        Choisir sur la carte
      </Button>

      <Box sx={{ backgroundColor: '#8cc5984f', mt: 4, p: 2, borderRadius: 4, width: '100%' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', textAlign: 'left' }}>PISTES POPULAIRES</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DatePicker value={dateDebut} onChange={(newValue) => setDateDebut(newValue)} label="De" format="DD-MM-YYYY" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DatePicker value={dateFin}  onChange={(newValue) => {setDateFin(newValue)}} label="À"  format="DD-MM-YYYY" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
          </Box>
        </LocalizationProvider>
        <Button disabled={!dateDebut || !dateFin} onClick={() => highlightMostPopular()} variant="contained" size="small" sx={{ width: '100%', justifyContent: 'flex-start', mb: 1, mt: 1 }}>Mettre en surbrillance</Button>
        <Button onClick={() => {reinitialiserPistePopulaire()}} variant="outlined"  size="small" sx={{ width: '100%', justifyContent: 'flex-start', mb: 1, backgroundColor: '#ffffff', borderWidth: 2 }}>Réinitialiser</Button>
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
            overlayFeature={selectedArrFeature}
          />
        </Box>
      </Box>

      <ArrondissementMapDialog
        open={arrMapOpen}
        onClose={() => setArrMapOpen(false)}
        territoires={territoires}
        value={arrondissement}
        onChange={setArrondissement}
      />
    </Box>
  );
}