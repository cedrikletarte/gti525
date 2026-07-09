'use strict';

function parseISODate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const parts = str.split('-');
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return str;
}

function parseCsv(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
    return obj;
  });
}

module.exports = { parseISODate, parseCsv };
