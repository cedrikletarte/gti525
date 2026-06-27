import { useState, useEffect } from 'react';

// Loads the borough boundaries (territoires.geojson) once. Returns the GeoJSON
// FeatureCollection, or null while loading / on error.
export default function useTerritoires() {
  const [territoires, setTerritoires] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/gti525/v1/territoires')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('territoires'))))
      .then((data) => { if (active) setTerritoires(data); })
      .catch(() => { if (active) setTerritoires(null); });
    return () => { active = false; };
  }, []);

  return territoires;
}
