import { useState, useMemo } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, Container, Paper, Chip, TextField, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../components/Navbar';
import poiCsvRaw from '../data/poi.csv?raw';
import territoiresCsvRaw from '../data/territoires.csv?raw';

// Analyseur CSV générique pour gérer les guillemets et les virgules
function parseCSV(str) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inQuotes) {
      if (char === '"') {
        if (str[i + 1] === '"') { val += '"'; i++; }
        else { inQuotes = false; }
      } else { val += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(val.trim()); val = ''; }
      else if (char === '\n' || char === '\r') {
        row.push(val.trim()); val = '';
        if (row.length > 1 || row[0] !== '') { result.push(row); }
        row = [];
        if (char === '\r' && str[i + 1] === '\n') { i++; }
      } else { val += char; }
    }
  }
  if (val || row.length > 0) { row.push(val.trim()); result.push(row); }
  return result;
}

function csvToObjects(csvArray) {
  if (csvArray.length === 0) return [];
  const headers = csvArray[0];
  return csvArray.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => { obj[header] = row[index] || ''; });
    return obj;
  });
}

export default function PointInteret() {
  const [selectedArrondissement, setSelectedArrondissement] = useState('Tous');
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  const territoires = useMemo(() => {
    const terrRows = parseCSV(territoiresCsvRaw);
    const terrList = terrRows.filter(r => r[0]).map(r => r[0]);
    return [...new Set(terrList)].sort();
  }, []);

  const data = useMemo(() => {
    // Parser Fontaines (poi.csv)
    const poiObjects = csvToObjects(parseCSV(poiCsvRaw));
    const fontaines = poiObjects.filter(r => r.ID).map(row => ({
      id: `f_${row.ID}`,
      arrondissement: row.Arrondissement || 'Non spécifié',
      type: 'Fontaine', 
      nom: row.Nom_parc_lieu || '',
      adresse: row.Intersection || '',
      latitude: row.Latitude,
      longitude: row.Longitude,
    }));

    return fontaines;
  }, []);

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

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField 
              size="small" 
              label="Rechercher par nom" 
              variant="outlined" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{ minWidth: 250, flexGrow: {md: 1} }}
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

        <Paper sx={{ width: '100%', height: 650, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            pageSizeOptions={[20]}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              }
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
}
