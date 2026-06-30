import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { normArr, ALL } from '../lib/arrondissement';

// Leaflet maps initialised inside a closed/animating dialog mount at size 0 and
// render grey tiles; force a resize once the dialog has opened.
function InvalidateOnOpen() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Reusable "select a borough on the map" modal, shared by the Réseau,
// Statistiques and Points d'intérêt views. Click a polygon to set `value`
// (the territoire NOM), click it again to clear. Stays in sync with the
// dropdown because both drive the same parent state.
export default function ArrondissementMapDialog({ open, onClose, territoires, value, onChange }) {
  const selectedNorm = value === ALL ? null : normArr(value);

  const style = (feature) => {
    const isSelected = selectedNorm && normArr(feature.properties.NOM) === selectedNorm;
    return {
      color: isSelected ? '#1f5b2c' : '#2d6a4f',
      weight: isSelected ? 3 : 1,
      fillColor: isSelected ? '#2d6a4f' : '#84CA4B',
      fillOpacity: isSelected ? 0.55 : 0.12,
    };
  };

  const onEachFeature = (feature, layer) => {
    const nom = feature.properties.NOM;
    layer.bindTooltip(nom, { sticky: true });
    layer.on('click', () => {
      onChange(selectedNorm === normArr(nom) ? ALL : nom);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Sélection par arrondissement
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur un arrondissement pour filtrer les données affichées.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {value === ALL ? 'Tous les arrondissements' : value}
          </Typography>
        </Box>

        <Box sx={{ height: 480, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
          {territoires && (
            <MapContainer center={[45.55, -73.7]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <InvalidateOnOpen />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <GeoJSON key={value} data={territoires} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => onChange(ALL)} disabled={value === ALL}>
            Réinitialiser
          </Button>
          <Button variant="contained" onClick={onClose}>
            Fermer
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
