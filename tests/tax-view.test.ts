import {describe, expect, it} from 'vitest';
import {taxRows, taxSources} from '../src/lib/tax-view-data';
import {compareTax, completeClass, comparisonQuery, monthlyPence, type TaxRow} from '../src/lib/tax-view';
import {loadYear, YEARS} from '../src/lib/council-tax';
import {matchesCouncil} from '../src/lib/council-search';
const rows = taxRows();
const state = {a: 'burnley', b: 'pendle', band: 'D', year: '2026-27'};
describe('published council tax comparisons', () => {
  it('reconciles every held band to its official area value without inventing missing years', () => {
    for (const row of rows) for (const year of YEARS) {
      const published = loadYear(year).authorities[row.gss];
      for (const [band, pence] of Object.entries(row.years[year])) {
        expect(pence).toBe(Math.round(published.bands[band as 'D'] * 100));
      }
      if (!published || published.classCode !== row.classCode) expect(row.years[year]).toEqual({});
    }
  });
  it('calculates penny-exact differences and reverses the direction when swapped', () => {
    const result = compareTax(rows, state, YEARS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.aPence).toBe(254942);
    expect(result.differencePence).toBe(result.bPence - 254942);
    const swapped = compareTax(rows, {...state, a: state.b, b: state.a}, YEARS);
    expect(swapped.ok && swapped.differencePence).toBe(-result.differencePence);
    expect(monthlyPence(254942)).toBe(25494);
  });
  it.each([
    {b: 'burnley'}, {b: 'does-not-exist'}, {b: 'manchester'}, {band: 'I'}, {year: '2030-31'},
  ])('rejects an invalid request %j', patch => {
    expect(compareTax(rows, {...state, ...patch}, YEARS).ok).toBe(false);
  });
  it('does not turn missing, zero or invalid figures into a comparison', () => {
    for (const value of [undefined, 0, NaN, -1]) {
      const copy = structuredClone(rows);
      copy.find(row => row.slug === 'pendle')!.years['2026-27'].D = value;
      expect(compareTax(copy, state, YEARS).ok).toBe(false);
      expect(completeClass(copy, 'SD', '2026-27', 'D')).toBe(false);
    }
  });
  it('preserves a genuine unchanged charge and checks the measure basis', () => {
    const copy = structuredClone(rows);
    copy.find(row => row.slug === 'pendle')!.years['2026-27'].D = 254942;
    const result = compareTax(copy, state, YEARS);
    expect(result.ok && result.differencePence).toBe(0);
    copy.find(row => row.slug === 'pendle')!.basis = 'own-share' as TaxRow['basis'];
    expect(compareTax(copy, state, YEARS).ok).toBe(false);
  });
  it('carries publication, revision and file identity separately', () => {
    for (const source of Object.values(taxSources())) {
      expect(source.url).toMatch(/^https:\/\/www.gov.uk\//);
      expect(source.files.length).toBeGreaterThan(0);
      for (const file of source.files) expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });
  it('serialises only the documented selection fields', () => {
    expect(comparisonQuery(state)).toBe('a=burnley&b=pendle&band=D&year=2026-27');
  });
});
it('finds accented and punctuated council names without treating regex input as code', () => {
  expect(matchesCouncil('kings lynn', "King's Lynn and West Norfolk")).toBe(true);
  expect(matchesCouncil('lynn norfolk', "King's Lynn and West Norfolk")).toBe(true);
  expect(matchesCouncil('burnley', 'Búrnlèy Borough Council')).toBe(true);
  expect(matchesCouncil('<script>', 'Burnley')).toBe(false);
});
