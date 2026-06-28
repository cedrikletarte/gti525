import { useMemo, useState } from 'react';
import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LegendDialog from './LegendDialog';
import MapMarker from './MapMarker.jsx'

// ─── Category classification ───────────────────────────────────────────────

const CATEGORY_COLORS = {
  rev:               '#2AC7DD',
  voiePartagee:      '#84CA4B',
  voieProtegee:      '#025D29',
  sentierPolyvalent: '#B958D9',
};

export const MAP_CATEGORIES = [
  { key: 'rev',               label: 'REV',               color: '#2AC7DD', description: 'Réseau Express Vélo — REV_AVANCEMENT_CODE ∈ {EV, PE, TR}' },
  { key: 'voiePartagee',      label: 'Voie partagée',      color: '#84CA4B', description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE ∈ {1, 3, 8, 9}' },
  { key: 'voieProtegee',      label: 'Voie protégée',      color: '#025D29', description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE ∈ {4, 5, 6}' },
  { key: 'sentierPolyvalent', label: 'Sentier polyvalent', color: '#B958D9', description: 'AVANCEMENT_CODE = E et TYPE_VOIE_CODE = 7' },
];

export function getCategory(props) {
  const rev      = props.REV_AVANCEMENT_CODE;
  const avance   = props.AVANCEMENT_CODE;
  const typeVoie = parseInt(props.TYPE_VOIE_CODE, 10);

  if (['EV', 'PE', 'TR'].includes(rev)) return 'rev';
  if (avance === 'E') {
    if ([1, 3, 8, 9].includes(typeVoie)) return 'voiePartagee';
    if ([4, 5, 6].includes(typeVoie))    return 'voieProtegee';
    if (typeVoie === 7)                  return 'sentierPolyvalent';
  }
  return null;
}

function styleFeature(feature) {
  return {
    color:   CATEGORY_COLORS[getCategory(feature.properties)] ?? '#999999',
    weight:  3,
    opacity: 0.85,
  };
}

// ─── Props ─────────────────────────────────────────────────────────────────
//
//  features  {Array}   GeoJSON feature array (already filtered by parent)
//  loading   {boolean} Show loading overlay while data is fetching
//  error     {string?} If set, map tiles still render but no GeoJSON is drawn
//  center    {[lat, lng]}  Default: [45.5017, -73.5673] (Montréal)
//  zoom      {number}  Default: 10
//
// ─── Component ────────────────────────────────────────────────────────────

export default function InteractiveMap({
  features = [],
  loading  = false,
  error    = null,
  center   = [45.5017, -73.5673],
  zoom     = 10,
  markers     = [],
  selectedMarker    = null,
}) {
  const [legendOpen, setLegendOpen] = useState(false);

  const geoJson = useMemo(() => ({
    type: 'FeatureCollection',
    features,
  }), [features]);

  // Stable key so Leaflet re-renders GeoJSON when the feature set changes
  const geoJsonKey = features.length + features.map(f => f.properties?.ID_TRC ?? '').join('');

  const totalKm = useMemo(
    () => features.reduce((sum, f) => sum + (f.properties.LONGUEUR || 0), 0).toFixed(1),
    [features],
  );

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 600 }}>
      {/* Loading overlay */}
      {loading && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.7)',
        }}>
          <CircularProgress />
        </Box>
      )}
      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />


        {markers.map((c) =>
            <MapMarker
                key={c.ID}
                obj={c}
                selected={c.ID === selectedMarker}
            />
        )}
        {!loading && !error && (
          <GeoJSON key={geoJsonKey} data={geoJson} style={styleFeature} />
        )}
      </MapContainer>
      {/* Legend button */}
      {
          features.length > 0 ?
          <IconButton
            onClick={() => setLegendOpen(true)}
            sx={{
              position: 'absolute', top: 10, right: 10, zIndex: 1000,
              bgcolor: '#ffffff', '&:hover': { bgcolor: '#f5f5f5' },
            }}
            size="small"
          >
            <InfoOutlinedIcon />
          </IconButton>
        :
            null
      }

      {/* Stats chip */}
      {
        features.length > 0 ?
            <Paper sx={{
                position: 'absolute', bgcolor: '#ffffff', zIndex: 1000,
                bottom: 25, right: 10,
                display: 'flex', alignItems: 'center', p: 1, gap: 0.5,
            }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{features.length}</Typography>
                <Typography sx={{ fontSize: 15 }}>pistes affichées,</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{totalKm}</Typography>
                <Typography sx={{ fontSize: 15 }}>km</Typography>
            </Paper>
        :
            null
      }
      

      {/* Legend modal */}
      <LegendDialog categories={MAP_CATEGORIES} open={legendOpen} onClose={() => setLegendOpen(false)} />
    </Box>
  );
}