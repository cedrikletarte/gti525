import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import Navbar from '../components/Navbar';

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

function ActionsCell({ params }) {
  const { Latitude, Longitude } = params.row;
  if (!Latitude || !Longitude) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${Latitude},${Longitude}`;
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
      <Button variant="outlined" color="primary" size="small" href={mapsUrl} target="_blank" rel="noopener noreferrer">
        Carte
      </Button>
      <Button variant="contained" color="primary" size="small">
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
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    sortable: false,
    filterable: false,
    headerClassName: 'grid-header',
    renderCell: (params) => <ActionsCell params={params} />,
  },
];

export default function Statistic() {
  const [compteurs, setCompteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/gti525/v1/compteurs')
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.erreur)))
      .then(data => { setCompteurs(data); setLoading(false); })
      .catch(err => { setError(typeof err === 'string' ? err : 'Failed to load counters.'); setLoading(false); });
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return compteurs;
    return compteurs.filter((r) => r.Nom.toLowerCase().includes(q));
  }, [search, compteurs]);

  const handleClear = () => setSearch('');

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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Rechercher par nom..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 220, flexGrow: { md: 1 } }}
              />
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
                  columns={COLUMNS}
                  getRowId={(row) => row.ID}
                  localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                  initialState={{pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
                  pageSizeOptions={[20]}
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
      </main>
    </Box>
  );
}
