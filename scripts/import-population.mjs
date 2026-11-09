/** ONS MYE25UK, pinned to B2-FRONT-DOOR-SOURCE-NOTES.md. */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readSheet} from 'read-excel-file/node';

export const POPULATION_HASH = '8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f';
const fail = message => {throw new Error(`Population: ${message}; stop for review`);};
export function verifyPopulationHash(bytes) {
  if (createHash('sha256').update(bytes).digest('hex') !== POPULATION_HASH) fail('ONS pinned hash differs');
}
export async function buildPopulation() {
  const source = JSON.parse(readFileSync(resolve(process.cwd(), 'data/population/source.json'), 'utf8'));
  const path = resolve(process.cwd(), 'data/raw', source.file);
  if (source.sha256 !== POPULATION_HASH) fail('source manifest hash differs');
  await ensurePopulationWorkbook();
  const rows = await readSheet(path, source.sheet);
  const headerIndex = rows.findIndex(row => row[0] === 'Code');
  if (headerIndex < 0) fail('missing Code header');
  const header = rows[headerIndex];
  const column = label => {
    const index = header.indexOf(label);
    if (index < 0) fail(`missing text header ${label}`);
    return index;
  };
  const areas = {};
  for (const row of rows.slice(headerIndex + 1)) {
    const code = row[column('Code')];
    if (typeof code !== 'string' || !/^E\d{8}$/.test(code)) continue;
    if (areas[code]) fail(`duplicate code ${code}`);
    const count = label => {
      const value = row[column(label)];
      if (!Number.isSafeInteger(value) || value < 0) fail(`invalid count ${code} ${label}`);
      return value;
    };
    const sum = (start, end) => Array.from({length: end - start + 1}, (_, i) => count(String(start + i))).reduce((a, b) => a + b, 0);
    const under18 = sum(0, 17);
    const age18to64 = sum(18, 64);
    const age65plus = sum(65, 89) + count('90 and over');
    const allAges = count('All ages');
    if (under18 + age18to64 + age65plus !== allAges) fail(`age sum differs ${code}`);
    areas[code] = {code, name: row[column('Name')], geography: row[column('Geography')], allAges, under18, age18to64, age65plus, age18plus: age18to64 + age65plus};
  }
  validatePopulation(areas);
  return {schemaVersion: 1, source, areas: Object.fromEntries(Object.entries(areas).map(([code, {name, geography, allAges}]) => [code, {code, name, geography, allAges}]))};
}
export function validatePopulation(areas) {
  const expected = {'Country': 1, 'Region': 9, 'Unitary Authority': 63, 'Metropolitan County': 6, 'Metropolitan District': 36, 'County': 21, 'Non-metropolitan District': 164, 'London Borough': 33};
  const counts = {};
  for (const area of Object.values(areas)) counts[area.geography] = (counts[area.geography] ?? 0) + 1;
  if (Object.keys(areas).length !== 333 || Object.keys(counts).length !== Object.keys(expected).length) fail('English row count differs');
  for (const [key, count] of Object.entries(expected)) if (counts[key] !== count) fail(`geography count differs ${key}`);
  const anchors = {E08000025: [894082, 737841, 156241, 282878], E09000033: [185163, 157520, 27643, 27204], E10000017: [1048053, 768005, 280048, 260514]};
  for (const [code, values] of Object.entries(anchors)) ['age18plus', 'age18to64', 'age65plus', 'under18'].forEach((key, i) => {
    if (areas[code]?.[key] !== values[i]) fail(`anchor differs ${code} ${key}`);
  });
  const totals = {E07000117: 100946, E08000025: 1176960, E10000017: 1308567, E09000001: 15631, E06000053: 2299};
  for (const [code, value] of Object.entries(totals)) if (areas[code]?.allAges !== value) fail(`all ages anchor differs ${code}`);
  if (!areas.E08000016 || !areas.E08000019 || areas.E08000038 || areas.E08000039) fail('boundary codes differ');
}
export async function ensurePopulationWorkbook() {
  const source = JSON.parse(readFileSync(resolve(process.cwd(), 'data/population/source.json'), 'utf8'));
  const path = resolve(process.cwd(), 'data/raw', source.file);
  mkdirSync(resolve(process.cwd(), 'data/raw'), {recursive: true});
  if (!existsSync(path)) {
    const response = await fetch(source.fileUrl);
    if (!response.ok) fail(`ONS HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    verifyPopulationHash(bytes);
    writeFileSync(path, bytes);
  }
  verifyPopulationHash(readFileSync(path));
}
export async function importPopulation() {
  const data = await buildPopulation();
  writeFileSync(resolve(process.cwd(), 'data/population/mye25-population.json'), JSON.stringify(data, null, 2) + '\n');
  console.log('ONS mid-2025: 333 English rows; pinned hash, geography counts, age sums and anchors passed.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importPopulation();
