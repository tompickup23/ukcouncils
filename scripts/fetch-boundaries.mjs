/** ONS geometry snapshot. Refresh deliberately; builds use the committed copy. */
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const service = 'https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Local_Authority_Districts_May_2026_Boundaries_UK_BSC/FeatureServer/0';
const params = new URLSearchParams({where: "LAD26CD LIKE 'E%'", outFields: 'LAD26CD,LAD26NM', returnGeometry: 'true', outSR: '4326', geometryPrecision: '5', maxAllowableOffset: '0.001', f: 'geojson'});
const url = `${service}/query?${params}`;
const response = await fetch(url);
if (!response.ok) throw new Error(`Boundary HTTP ${response.status}`);
const raw = await response.text(); const data = JSON.parse(raw);
if (data.type !== 'FeatureCollection' || !Array.isArray(data.features) || data.exceededTransferLimit || data.features.length < 290) throw new Error('Incomplete boundary response');
const codes = data.features.map(f => f.properties.LAD26CD);
if (new Set(codes).size !== codes.length || data.features.some(f => !['Polygon','MultiPolygon'].includes(f.geometry?.type))) throw new Error('Invalid or duplicated geometry');
await mkdir('data/geography', {recursive: true});
await writeFile('data/geography/lad26-england.geojson', raw);
await writeFile('data/geography/source.json', JSON.stringify({
  publisher: 'Office for National Statistics', title: 'Local Authority Districts (May 2026) Boundaries UK BSC', date: 'May 2026',
  url: 'https://www.data.gov.uk/dataset/811be825-44a9-427d-bf7f-c34c75f616ef/local-authority-districts-may-2026-boundaries-uk-bsc',
  service, query: url, retrieved: new Date().toISOString(), sha256: createHash('sha256').update(raw).digest('hex'), count: codes.length,
  licence: 'Open Government Licence v3.0', licenceUrl: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
  attribution: 'Contains OS data © Crown copyright and database right 2026. Contains National Statistics data © Crown copyright and database right 2026.',
  method: 'England features only. ArcGIS generalisation tolerance 0.001 degrees, five decimal places. Illustrative boundaries, not property or billing boundaries. Joined by exact LAD26CD only.'
}, null, 2) + '\n');
console.log(`Saved ${codes.length} England boundaries (${raw.length} bytes).`);
