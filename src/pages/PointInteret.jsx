import { useState, useEffect, useMemo, useCallback } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../components/Navbar';
import ArrondissementMapDialog from '../components/ArrondissementMapDialog';
import useTerritoires from '../lib/useTerritoires';
import {arrOptionsFrom, ALL} from '../lib/arrondissement';
import InteractiveMap from "../components/InteractiveMap.jsx";
import PointInteretDialog from "../components/PointInteretDialog.jsx";
import PointInteretDeleteDialog from "../components/PointInteretDeleteDialog.jsx";
import CloseIcon from '@mui/icons-material/Close';

export default function PointInteret() {
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState(ALL);
  const [arrMapOpen, setArrMapOpen] = useState(false);
  const [carteOpen, setCarteOpen] = useState(false);
  const [arrAddFormOpen, setArrAddFormOpen] = useState(false);
  const [arrDelFormOpen, setArrDelFormOpen] = useState(false);
  const territoires = useTerritoires();
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const [mode, setMode] = useState('create');
  // Bumping this forces the effect below to refetch, without depending on
  // filters/pagination changing. Any successful create/edit/delete should
  // call refetch() (which just increments this).
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      limite: paginationModel.pageSize,
      page:   paginationModel.page + 1,
    });
    if (searchName)                     params.append('nom',           searchName);
    if (selectedArrondissement !== ALL) params.append('arrondissement', selectedArrondissement);
    if (selectedType !== 'Tous')        params.append('type',           selectedType);

    fetch(`/gti525/v1/pointsdinteret?${params}`)
        .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
        .then(json => {
          setPois(json.donnees ?? []);
          setRowCount(json.total ?? 0);
          setLoading(false);
        })
        .catch(err => {
          setError(typeof err === 'string' ? err : 'Failed to load points of interest.');
          setLoading(false);
        });
  }, [paginationModel, searchName, selectedArrondissement, selectedType, refreshTrigger]);

  const arrOptions = useMemo(() => arrOptionsFrom(territoires), [territoires]);

  const data = useMemo(() => {
    return pois.filter(r => r.ID).map(row => ({
      id: `${row.ID}`,
      Arrondissement: row.Arrondissement || 'Non spécifié',
      Type: row.Type || 'Fontaine',
      Nom: row.Nom_parc_lieu || '',
      Adresse: row.Intersection || '',
      Latitude: row.Latitude,
      Longitude: row.Longitude,
    }));
  }, [pois]);

  function handleSearchChange(e) {
    setSearchName(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  }

  function handleTypeChange(e) {
    setSelectedType(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  }

  function handleArrondissementChange(e) {
    setSelectedArrondissement(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  }

  function handleCarteClick(params){
    setSelectedPoi(params);
    setCarteOpen(true);
  }

  function handleEditClick(params){
    setSelectedPoi(params);
    setArrAddFormOpen(true);
    setMode('edit');
  }

  function handleDeleteClick(params){
    setSelectedPoi(params);
    setArrDelFormOpen(true);
  }

  function ActionsCell({ params }) {
    if (!params.row?.Latitude || !params.row?.Longitude) return null;
    return (
        <Stack direction="row" spacing={0}>
          <IconButton
              size="small"
              color="primary"
              onClick={() => handleCarteClick(params.row)}
          >
            <MapIcon/>
          </IconButton>

          <IconButton color="primary" size="small" onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>

          <IconButton color="error" size="small" onClick={() => handleDeleteClick(params.row)}>
            <DeleteIcon/>
          </IconButton>
        </Stack>
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
          <ActionsCell params={params} />
      ),
    }
  ], []);

  return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
        <Navbar activePage="Points d'intérêt" />

        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Points d'intérêt cyclable
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() =>
            {setSelectedPoi(null); setArrAddFormOpen(true); setMode("create")}}>Nouveau point d'intérêt</Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{alignItems : "center"}}>
              <TextField
                  size="small"
                  label="Rechercher par nom"
                  variant="outlined"
                  value={searchName}
                  onChange={handleSearchChange}
                  sx={{ minWidth: 250, flexGrow: { md: 1 } }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select labelId="type-select-label" value={selectedType} label="Type" onChange={handleTypeChange}>
                  <MenuItem value="Tous">Tous</MenuItem>
                  <MenuItem value="Fontaine">Fontaine</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel id="arrondissement-select-label">Filtrer par arrondissement</InputLabel>
                <Select labelId="arrondissement-select-label" value={selectedArrondissement} label="Filtrer par arrondissement" onChange={handleArrondissementChange}>
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
                    rows={data}
                    columns={columns}
                    paginationMode="server"
                    rowCount={rowCount}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => setPaginationModel(model)}
                    pageSizeOptions={[20, 50, 100]}
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
            onChange={(val) => {
              setSelectedArrondissement(val);
              setPaginationModel(prev => ({ ...prev, page: 0 }));
            }}
        />

        <Dialog open={ carteOpen } onClose={() => setCarteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ pr: 6, color: '#000000' }}>
            {selectedPoi?.Nom}
          </DialogTitle>
          <IconButton onClick={() => setCarteOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            <InteractiveMap
                center={[selectedPoi?.Latitude, selectedPoi?.Longitude]}
                zoom={20}
                markers = {data.map((m) => ({
                  ID: m.id,
                  Nom: m.Nom,
                  Latitude: m.Latitude,
                  Longitude: m.Longitude,
                }))}
                selectedMarker={selectedPoi?.id}
            />
          </DialogContent>
        </Dialog>
        <PointInteretDialog
            open={arrAddFormOpen}
            onClose={() => setArrAddFormOpen(false)}
            onSaved={refetch}
            mode={mode}
            point={selectedPoi}
            arrondissements={arrOptions}
        />
        <PointInteretDeleteDialog
            open={arrDelFormOpen}
            onClose={() => setArrDelFormOpen(false)}
            onDeleted={refetch}
            point={selectedPoi}
        />
      </Box>
  );
}