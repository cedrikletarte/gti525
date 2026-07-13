'use strict';

function joinPath(mountPath, routePath) {
  if (routePath === '/') return mountPath || '/';
  const base = mountPath.endsWith('/') ? mountPath.slice(0, -1) : mountPath;
  return `${base}${routePath}`;
}

function listEndpoints(router, mountPath) {
  const endpoints = [];
  for (const layer of router.stack) {
    if (!layer.route) continue;
    const chemin = joinPath(mountPath, layer.route.path);
    for (const methode of Object.keys(layer.route.methods)) {
      endpoints.push({ methode: methode.toUpperCase(), chemin });
    }
  }
  return endpoints;
}

module.exports = listEndpoints;
