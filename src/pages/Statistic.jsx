import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import Navbar from '../components/Navbar';
import csvRaw from '../data/compteurs.csv?raw';

function parseCSV(raw) {
  const [headerLine, ...lines] = raw.trim().split('\n');
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines
    .filter((l) => l.trim())
    .map((line, idx) => {
      const values = line.split(',');
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']));
      return { ...row, _id: idx };
    });
}

const ALL_ROWS = parseCSV(csvRaw);

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
        lineHeight: '52px', // hauteur par défaut d'une row MUI DataGrid
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
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_ROWS;
    return ALL_ROWS.filter((r) => r.Nom.toLowerCase().includes(q));
  }, [search]);

  const handleClear = () => setSearch('');

  return (
    <>
      <header>
        <Navbar activePage="Statistiques" />
      </header>

      <main>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>

          {/* Filtres */}
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

          {/* Data Grid */}
          <Box
            sx={{
              width: '100%',
              '& .grid-header': {
                color: 'primary.main',
                fontWeight: 700,
              },
            }}
          >
            <DataGrid
              rows={rows}
              columns={COLUMNS}
              getRowId={(row) => row._id}
              localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'Nom', sort: 'asc' }] },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(45,106,79,0.04)',
                },
              }}
            />
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
