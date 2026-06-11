import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Container,
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
    <>
      <header>
        <Navbar activePage="Statistiques" />
      </header>

      <main>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Compteurs vélo
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Rechercher par nom..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 220 }}
              />
              <Button variant="outlined" color="primary" onClick={handleClear}>
                Effacer les filtres
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              '& .grid-header': {
                color: 'primary.main',
                fontWeight: 700,
              },
            }}
          >
            {loading
              ? <CircularProgress sx={{ mt: 6 }} />
              : <DataGrid
                  rows={rows}
                  columns={COLUMNS}
                  getRowId={(row) => row.ID}
                  localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                    sorting: { sortModel: [{ field: 'Nom', sort: 'asc' }] },
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  disableRowSelectionOnClick
                  sx={{
                    width: '100%',
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f5f5f5',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(45,106,79,0.04)',
                    },
                  }}
                />
            }
          </Box>
        </Container>
      </main>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MTL Vélo — Données ouvertes Ville de Montréal
          </Typography>
        </Container>
      </Box>
    </>
  );
}
