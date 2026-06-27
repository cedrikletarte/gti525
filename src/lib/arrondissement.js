// Shared helpers for borough (arrondissement) selection across the Réseau,
// Statistiques and Points d'intérêt views.

// Sentinel value meaning "no borough filter".
export const ALL = 'all';

// Normalises a borough name so the same arrondissement matches across the three
// datasets, which spell compound names differently:
//   - pistes use en-dashes (–) and a "Le " prefix  (e.g. "Le Plateau-Mont-Royal")
//   - poi/territoires use plain hyphens             (e.g. "Plateau-Mont-Royal")
// Strips accents/case, unifies every dash/space/apostrophe and the leading article.
export function normArr(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, ' ')
    .replace(/[\s\-–—_]+/g, ' ')
    .replace(/^(le|la|les)\s+/, '')
    .trim();
}

// Sorted list of canonical borough names (territoires.geojson NOM) for dropdowns.
export function arrOptionsFrom(territoires) {
  if (!territoires) return [];
  return territoires.features
    .map((f) => f.properties.NOM)
    .sort((a, b) => a.localeCompare(b, 'fr'));
}

// Ray-casting test: is point (x=lng, y=lat) inside a single ring?
function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Is the point inside a (Multi)Polygon feature? Respects holes.
export function pointInFeature(lng, lat, feature) {
  const g = feature && feature.geometry;
  if (!g) return false;
  const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
  for (const poly of polys) {
    if (pointInRing(lng, lat, poly[0]) && !poly.slice(1).some((h) => pointInRing(lng, lat, h))) {
      return true;
    }
  }
  return false;
}

// Returns the borough NOM containing the point, or null. Used to locate counters
// (compteurs.csv has no arrondissement column, only lat/lng).
export function arrondissementOf(lng, lat, territoires) {
  if (!territoires) return null;
  const f = territoires.features.find((ft) => pointInFeature(lng, lat, ft));
  return f ? f.properties.NOM : null;
}
