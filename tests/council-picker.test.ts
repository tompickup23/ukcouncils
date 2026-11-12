import {expect, it} from 'vitest';
import {englishRows} from '../src/lib/council-picker';
import {councilIndex} from '../src/lib/council-index';
import {councilPages, programmaticPaths} from '../src/lib/paths';
import {matchesCouncil, matchingRegion, normalise} from '../src/lib/council-search';

it('has one alphabetical row per profile, with held type, tier and complete geography', () => {
  const rows = englishRows();
  expect(rows.map(row => row.href).sort()).toEqual(programmaticPaths().filter(path => /^\/councils\/[^/]+\/$/.test(path)).sort());
  expect(rows.map(row => row.name)).toEqual(rows.map(row => row.name).sort((a,b) => a.localeCompare(b, 'en-GB')));
  for (const {council} of councilPages()) {
    const row = rows.find(row => row.gss === council.gss)!;
    expect(row.region).toBe(council.region);
    expect(row.tier).toBe(council.parentGss ? 'Lower tier' : 'Single tier');
    expect(row.type).toBe(council.type === 'Non-metropolitan district' ? 'Shire district' : council.type);
    if (council.type === 'Non-metropolitan district') expect(row.county).toBeTruthy();
  }
});

it('both indexes find twelve Lancashire districts and exactly the registry North West councils', () => {
  for (const rows of [englishRows(), councilIndex()]) {
    const query = (value: string) => {
      const region = matchingRegion(value, rows.map(row => row.region));
      return rows.filter(row => matchesCouncil(value, row.search) && (!region || normalise(row.region) === region));
    };
    expect(query('lancashire')).toHaveLength(12);
    expect(query('north west')).toHaveLength(councilPages().filter(row => row.council.region === 'North West').length);
    expect(query('north west').every(row => row.region === 'North West')).toBe(true);
  }
});
