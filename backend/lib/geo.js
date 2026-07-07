'use strict';

function normArr(s) {
  return (s || '').toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['']/g, ' ')
    .replace(/[\s\-–—_]+/g, ' ')
    .replace(/^(le|la|les)\s+/, '')
    .trim();
}

function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInFeature(lng, lat, feature) {
  const g = feature && feature.geometry;
  if (!g) return false;
  const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
  for (const poly of polys) {
    if (pointInRing(lng, lat, poly[0]) && !poly.slice(1).some(h => pointInRing(lng, lat, h))) return true;
  }
  return false;
}

const CATEGORIE_SQL = {
  rev:              `(rev_avancement_code IN ('EV','PE','TR'))`,
  voiePartagee:     `((rev_avancement_code IS NULL OR rev_avancement_code NOT IN ('EV','PE','TR')) AND avancement_code='E' AND type_voie_code IN ('1','3','8','9'))`,
  voieProtegee:     `((rev_avancement_code IS NULL OR rev_avancement_code NOT IN ('EV','PE','TR')) AND avancement_code='E' AND type_voie_code IN ('4','5','6'))`,
  sentierPolyvalent:`((rev_avancement_code IS NULL OR rev_avancement_code NOT IN ('EV','PE','TR')) AND avancement_code='E' AND type_voie_code='7')`,
};

module.exports = { normArr, pointInRing, pointInFeature, CATEGORIE_SQL };
