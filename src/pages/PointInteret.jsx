import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, Container, Paper, Chip, TextField, Stack, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../components/Navbar';

export default function PointInteret() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState('Tous');
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  useEffect(() => {
    fetch('/gti525/v1/pointsdinteret')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data => { setPois(data); setLoading(false); })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load points of interest.'); setLoading(false); });
  }, []);

  const territoires = useMemo(() => {
    return [...new Set(pois.map(r => r.Arrondissement).filter(Boolean))].sort();
  }, [pois]);

  const data = useMemo(() => {
    return pois.filter(r => r.ID).map(row => ({
      id: `f_${row.ID}`,
      arrondissement: row.Arrondissement || 'Non spécifié',
      type: 'Fontaine',
      nom: row.Nom_parc_lieu || '',
      adresse: row.Intersection || '',
      latitude: row.Latitude,
      longitude: row.Longitude,
    }));
  }, [pois]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchArrond = selectedArrondissement === 'Tous' || item.arrondissement === selectedArrondissement;
      const matchType = selectedType === 'Tous' || item.type === selectedType;
      const matchName = searchName === '' || item.nom.toLowerCase().includes(searchName.toLowerCase());
      return matchArrond && matchType && matchName;
    });
  }, [data, selectedArrondissement, selectedType, searchName]);

  const columns = [
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={params.value === 'Fontaine' ? { bgcolor: '#e3f2fd', color: '#01579b', fontWeight: 'bold' } : {}}
        />
      )
    },
    { field: 'nom', headerName: 'Nom', flex: 1, minWidth: 150 },
    { field: 'arrondissement', headerName: 'Arrondissement', flex: 1, minWidth: 150 },
    { field: 'adresse', headerName: 'Intersection', flex: 2, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const { latitude, longitude } = params.row;
        if (!latitude || !longitude) return null;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        return (
          <Button
            variant="outlined"
            size="small"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
            Carte
          </Button>
        );
      }
    }
  ];

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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
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
              <Select
                labelId="type-select-label"
                value={selectedType}
                label="Type"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="Tous">Tous</MenuItem>
                <MenuItem value="Fontaine">Fontaine</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel id="arrondissement-select-label">Filtrer par arrondissement</InputLabel>
              <Select
                labelId="arrondissement-select-label"
                value={selectedArrondissement}
                label="Filtrer par arrondissement"
                onChange={(e) => setSelectedArrondissement(e.target.value)}
              >
                <MenuItem value="Tous">
                  <em>Tous les arrondissements</em>
                </MenuItem>
                {territoires.map((terr, index) => (
                  <MenuItem key={index} value={terr}>{terr}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 }
                }}
              />
          }
        </Paper>
      </Container>
    </Box>
  );
}
