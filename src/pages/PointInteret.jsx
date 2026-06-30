import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Container,
  Paper,
  Chip,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Dialog, DialogTitle, IconButton, DialogContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
import Navbar from '../components/Navbar';
import ArrondissementMapDialog from '../components/ArrondissementMapDialog';
import useTerritoires from '../lib/useTerritoires';
import { normArr, arrOptionsFrom, ALL } from '../lib/arrondissement';
import InteractiveMap from "../components/InteractiveMap.jsx";
import CloseIcon from '@mui/icons-material/Close';

export default function PointInteret() {
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState(ALL);
  const [arrMapOpen, setArrMapOpen] = useState(false);
  const territoires = useTerritoires();
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  useEffect(() => {
    fetch('/gti525/v1/pointsdinteret')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data => { setPois(data); setLoading(false); })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load points of interest.'); setLoading(false); });
  }, []);

  const arrOptions = useMemo(() => arrOptionsFrom(territoires), [territoires]);

  const data = useMemo(() => {
    return pois.filter(r => r.ID).map(row => ({
      id: `f_${row.ID}`,
      Arrondissement: row.Arrondissement || 'Non spécifié',
      Type: 'Fontaine',
      Nom: row.Nom_parc_lieu || '',
      Adresse: row.Intersection || '',
      Latitude: row.Latitude,
      Longitude: row.Longitude,
    }));
  }, [pois]);

  const filteredData = useMemo(() => {
    const selArr = selectedArrondissement === ALL ? null : normArr(selectedArrondissement);
    return data.filter(item => {
      const matchArrond = !selArr || normArr(item.Arrondissement) === selArr;
      const matchType = selectedType === 'Tous' || item.Type === selectedType;
      const matchName = searchName === '' || item.Nom.toLowerCase().includes(searchName.toLowerCase());
      return matchArrond && matchType && matchName;
    });
  }, [data, selectedArrondissement, selectedType, searchName]);


  function ActionsCell({ params, onCarteClick }) {
    if (!params.row?.Latitude || !params.row?.Longitude) return null;
    return (
        <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => onCarteClick(params.row)}
        >
          Carte
        </Button>
    );
  }


  const columns = useMemo(() => [
    { field: 'Type', headerName: 'Type', width: 140, renderCell: (params) => (
          <Chip label={params.value} size="small"
                sx={params.value === 'Fontaine' ? { bgcolor: '#e3f2fd', color: '#01579b', fontWeight: 'bold' } : {}} />
      )},
    { field: 'Nom', headerName: 'Nom', flex: 1, minWidth: 150 },
    { field: 'Arrondissement', headerName: 'Arrondissement', flex: 1, minWidth: 150 },
    { field: 'Adresse', headerName: 'Intersection', flex: 2, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
          <ActionsCell params={params} onCarteClick={setSelectedPoi} />
      ),
    }
  ], [setSelectedPoi]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      <Navbar activePage="Points d'intérêt" />

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Points d'intérêt cyclable
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Nouveau point d'intérêt
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{alignItems : "center"}}>
            <TextField
              size="small"
              label="Rechercher par nom"
              variant="outlined"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{ minWidth: 250, flexGrow: { md: 1 } }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="type-select-label">Type</InputLabel>
              <Select labelId="type-select-label" value={selectedType} label="Type" onChange={(e) => setSelectedType(e.target.value)}>
                <MenuItem value="Tous">Tous</MenuItem>
                <MenuItem value="Fontaine">Fontaine</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel id="arrondissement-select-label">Filtrer par arrondissement</InputLabel>
              <Select labelId="arrondissement-select-label" value={selectedArrondissement} label="Filtrer par arrondissement" onChange={(e) => setSelectedArrondissement(e.target.value)}>
                <MenuItem value={ALL}><em>Tous les arrondissements</em></MenuItem>
                {arrOptions.map((terr) => (
                  <MenuItem key={terr} value={terr}>{terr}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<MapIcon />}
              onClick={() => setArrMapOpen(true)}
              disabled={!territoires}
              sx={{ flexShrink: 0 }}
            >
              Carte
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ width: '100%', height: 650, borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} elevation={1}>
          {loading
            ? <CircularProgress />
            : <DataGrid
                rows={filteredData}
                columns={columns}
                initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
                pageSizeOptions={[20]}
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' },
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 }
                }}
              />
          }
        </Paper>
      </Container>

      <ArrondissementMapDialog
        open={arrMapOpen}
        onClose={() => setArrMapOpen(false)}
        territoires={territoires}
        value={selectedArrondissement}
        onChange={setSelectedArrondissement}
      />

      <Dialog open={selectedPoi !== null } onClose={() => setSelectedPoi(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pr: 6, color: '#000000' }}>
          {selectedPoi?.nom}
        </DialogTitle>
        <IconButton onClick={() => setSelectedPoi(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <InteractiveMap
              center={[selectedPoi?.Latitude, selectedPoi?.Longitude]}
              zoom={20}
              markers = {filteredData.map((m) => ({
                ID: m.id,
                Nom: m.Nom,
                Latitude: m.Latitude,
                Longitude: m.Longitude,
              }))}
              selectedMarker={selectedPoi?.id}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
