import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton, FormGroup
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import Navbar from '../components/Navbar';
import ArrondissementMapDialog from '../components/ArrondissementMapDialog';
import useTerritoires from '../lib/useTerritoires';
import { arrondissementOf, normArr, arrOptionsFrom, ALL } from '../lib/arrondissement';
import CloseIcon from '@mui/icons-material/Close';
import InteractiveMap from '../components/InteractiveMap';
import Chart from "../components/Chart.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

const STATUS_STYLES = {
  Actif: { backgroundColor: '#d4edda', color: '#1a5c2a' },
  'En maintenance': { backgroundColor: '#e8e8e8', color: '#444444' },
};

function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] ?? STATUS_STYLES['En maintenance'];
  return (
    <Box
      component="span"
      sx={{
        ...style,
        display: 'block',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        lineHeight: '52px',
        fontSize: '0.78rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Box>
  );
}


function ActionsCell({ params, onCarteClick, onPassageClick  }) {
  if (!params.row.Latitude || !params.row.Longitude) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
      <Button variant="outlined" color="primary" size="small" onClick={() => onCarteClick(params.row)}>
        Carte
      </Button>
      <Button variant="contained" color="primary" size="small" onClick={() => onPassageClick(params.row)}>
        Passages
      </Button>
    </Box>
  );
}

const COLUMNS = [
  {
    field: 'ID',
    headerName: 'ID',
    width: 120,
    headerClassName: 'grid-header',
  },
  {
    field: 'Nom',
    headerName: 'Nom',
    flex: 1,
    minWidth: 180,
    headerClassName: 'grid-header',
  },
  {
    field: 'Statut',
    headerName: 'Statut',
    width: 160,
    headerClassName: 'grid-header',
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <StatusBadge value={params.value} />
      </Box>
    ),
  },
  {
    field: 'Annee_implante',
    headerName: 'Année',
    width: 100,
    headerClassName: 'grid-header',
    type: 'number',
    align: 'left',
    headerAlign: 'left',
  }
];

export default function Statistic() {
  const [compteurs, setCompteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedArr, setSelectedArr] = useState(ALL);
  const [arrMapOpen, setArrMapOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const territoires = useTerritoires();
  const [selectedCompteur, setSelectedCompteur] = useState(null);
  const [passages, setPassages] = useState([]);
  const [carteOpen, setCarteOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({
      limite: paginationModel.pageSize,
      page:   paginationModel.page + 1,
    });
    if (search) params.append('nom', search);

    fetch(`/gti525/v1/compteurs?${params}`)
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data => {
        setCompteurs(data.donnees ?? []);
        setRowCount(data.total ?? 0);
        setLoading(false);
      })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load counters.'); setLoading(false); });
  }, [paginationModel, search]);

  // compteurs.csv has no borough column, so locate each counter by its coordinates.
  const arrByCounter = useMemo(() => {
    const map = {};
    if (!territoires) return map;
    for (const c of compteurs) {
      const lat = parseFloat(c.Latitude);
      const lng = parseFloat(c.Longitude);
      map[c.ID] = (lat && lng) ? arrondissementOf(lng, lat, territoires) : null;
    }
    return map;
  }, [compteurs, territoires]);

  const arrOptions = useMemo(() => arrOptionsFrom(territoires), [territoires]);

  const rows = useMemo(() => {
    const selArr = selectedArr === ALL ? null : normArr(selectedArr);
    if (!selArr) return compteurs;
    return compteurs.filter((r) => normArr(arrByCounter[r.ID]) === selArr);
  }, [compteurs, selectedArr, arrByCounter]);

  const columns = useMemo(() => [
    ...COLUMNS,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      headerClassName: 'grid-header',
      renderCell: (params) => (
        <ActionsCell params={params} onCarteClick={handleCarteClick} onPassageClick={handlePassageClick} />
      ),
    },
  ], []);

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setLoading(true);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  }

  const handleClear = () => {
    setSearch('');
    setSelectedArr(ALL);
    setLoading(true);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };


  function handleCarteClick(params){
      setSelectedCompteur(params);
      setCarteOpen(true);
  }



  async function handlePassageClick(params) {
    setDialogLoading(true);
    setSelectedCompteur(params);

    await fetch(`/gti525/v1/compteurs/${params.ID}/passages`)
        .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
        .then(data => { setPassages(data); setDialogLoading(false); })
        .catch(err => setError(typeof err === 'string' ? err : 'Failed to load passages.'));


      setChartOpen(true);

  }

  async function updatePassageDate(){
    setDialogLoading(true);

    const formdattedDateDebut = changeDateFormat(dateDebut);
    const formdattedDateFin = changeDateFormat(dateFin);
    setChartError(null);
    if(dateDebut && dateFin){
      await fetch(`/gti525/v1/compteurs/${selectedCompteur.ID}/passages?debut=${formdattedDateDebut}&fin=${formdattedDateFin}`)
          .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
          .then(data => { setPassages(data); setDialogLoading(false)})
          .catch(err => {setChartError(typeof err === 'string' ? err : 'Failed to load passages.'); setPassages([]); setDialogLoading(false); });
    }
  }

  function closeChart() {
    setChartOpen(false);
    setDateDebut(null);
    setDateFin(null);
    setChartError(null);
  }

  function changeDateFormat(input){
    const date = new Date(input);

    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }


  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      <header>
        <Navbar activePage="Statistiques" />
      </header>

      <main>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Compteurs vélo
          </Typography>
        </Box>

          {/* Filtres */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{alignItems : "center"}}>
              <TextField
                label="Rechercher par nom..."
                variant="outlined"
                size="small"
                value={search}
                onChange={handleSearchChange}
                sx={{ minWidth: 220, flexGrow: { md: 1 } }}
              />

              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel id="arr-select-label">Filtrer par arrondissement</InputLabel>
                <Select
                  labelId="arr-select-label"
                  value={selectedArr}
                  label="Filtrer par arrondissement"
                  onChange={(e) => setSelectedArr(e.target.value)}
                >
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

              <Button variant="outlined" color="primary" onClick={handleClear}>
                Effacer les filtres
              </Button>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Paper sx={{ width: '100%', height: 650, borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} elevation={1}>
            {loading
              ? <CircularProgress sx={{ mt: 6 }} />
              : <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.ID}
                  localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                  paginationMode="server"
                  rowCount={rowCount}
                  paginationModel={paginationModel}
                  onPaginationModelChange={(model) => { setLoading(true); setPaginationModel(model); }}
                  pageSizeOptions={[20, 50]}
                  disableRowSelectionOnClick
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
        {/*Map*/}
        <Dialog open={carteOpen} onClose={() => setCarteOpen(false)} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ pr: 6, color: '#000000' }}>
             {selectedCompteur?.Nom}
          </DialogTitle>
            <IconButton onClick={() => setCarteOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
          <DialogContent dividers>
                <InteractiveMap
                    center={[selectedCompteur?.Latitude, selectedCompteur?.Longitude]}
                    zoom={20}
                    markers = {rows.map((m) => ({
                      ID: m.ID,
                      Nom: m.Nom,
                      Latitude: m.Latitude,
                      Longitude: m.Longitude,
                    }))}
                    selectedMarker={selectedCompteur?.ID}
                />
          </DialogContent>
        </Dialog>
        {/*Chart*/}
        <Dialog open={chartOpen} onClose={() => closeChart()} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ pr: 6, color: '#000000' }}>
            Nombre de passage par jour pour le compteur  {selectedCompteur?.Nom}
          </DialogTitle>
          <IconButton onClick={() => closeChart()} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: {xs: "column", md: "row"}, alignItems: 'left', mb: 3 }}>
            <FormGroup>
              <Box sx={{ backgroundColor: '#8cc5984f', mt: 4, p: 2, borderRadius: 4, width: '100%' }}>
                {chartError && <Alert severity="error" sx={{ mb: 3 }}>{chartError}</Alert>}
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', textAlign: 'left' }}>Filtres</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DatePicker value={dateDebut} onChange={(newValue) => setDateDebut(newValue)} label="De" format="YYYY-MM-DD" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DatePicker value={dateFin} onChange={(newValue) => setDateFin(newValue)} label="À"  format="YYYY-MM-DD" sx={{ backgroundColor: '#ffffff', mt: 1, mb: 1, width: '100%' }} slotProps={{ textField: { size: 'small' } }} />
                  </Box>
                </LocalizationProvider>
                <Button disabled={!dateDebut || !dateFin} onClick={updatePassageDate} variant="contained" size="small" sx={{ width: '100%', justifyContent: 'flex-start', mb: 1, mt: 1 }}>Appliquer les filtres</Button>
              </Box>
            </FormGroup>
            {dialogLoading
                ? <CircularProgress sx={{ mt: 6 }} />
                :  <Chart data={passages} />
            }
          </Box>
          </DialogContent>
        </Dialog>
      </main>

      <ArrondissementMapDialog
        open={arrMapOpen}
        onClose={() => setArrMapOpen(false)}
        territoires={territoires}
        value={selectedArr}
        onChange={(val) => {
          setSelectedArr(val);
          setPaginationModel(prev => ({ ...prev, page: 0 }));
        }}
      />
    </Box>
  );
}
