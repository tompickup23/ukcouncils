import { describe, expect, it } from 'vitest';
import { councilIndex } from '../src/lib/council-index';
import { councilPages, councilPath, programmaticPaths } from '../src/lib/paths';
import { councilRank, matchesCouncil, normalise, rankCouncils, searchStatus } from '../src/lib/council-search';
import { pageTypeFor, pageTypeLabel } from '../src/lib/page-type';
import { GET } from '../src/pages/council-index.json';

describe('council index', () => {
  it('holds one row per profile route and no other route', () => {
    const rows = councilIndex();
    const routes = programmaticPaths().filter(path => path.startsWith('/councils/'));
    expect(rows.map(row => row.url).sort()).toEqual(routes.sort());
    expect(new Set(rows.map(row => row.url)).size).toBe(rows.length);
    expect(new Set(rows.map(row => row.slug)).size).toBe(rows.length);
    for (const { council, tax } of councilPages()) {
      expect(rows.find(row => row.url === councilPath(council))).toEqual({
        name: tax.name, officialName: council.officialName, slug: council.slug,
        region: council.region, type: council.type, url: councilPath(council),
      });
    }
  });

  it('serves only the council rows as JSON', async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);
    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(await response.json()).toEqual(councilIndex());
  });

  it('matches every typed word as a substring of the name or official name', () => {
    const burnley = councilIndex().find(row => row.slug === 'burnley')!;
    expect(matchesCouncil('ley burn', burnley.name, burnley.officialName)).toBe(true);
    expect(matchesCouncil('burn missing', burnley.name, burnley.officialName)).toBe(false);
    expect(normalise('  BÚRNLEY  ')).toBe('burnley');
  });
});

it('classifies each kind of page using the path supplied to BaseLayout', () => {
  expect(pageTypeFor('/councils/burnley/')).toBe('council');
  expect(pageTypeFor('/council-tax/band-d/')).toBe('band');
  expect(pageTypeFor('/council-tax/north-west/')).toBe('region');
  expect(pageTypeFor('/council-tax/increases/')).toBe('guide');
  expect(pageTypeFor('/methodology/')).toBe('guide');
  expect(pageTypeFor('/your-area/')).toBe('tool');
  expect(pageTypeFor('/compare/')).toBe('tool');
  expect(pageTypeFor('/councils/')).toBe('hub');
  expect(pageTypeFor('/404/')).toBe('other');
});

it('labels results in reader words and leaves other pages unlabelled', () => {
  expect(pageTypeLabel('council')).toBe('Council');
  expect(pageTypeLabel('hub')).toBe('Overview');
  expect(pageTypeLabel('tool')).toBe('Tool');
  expect(pageTypeLabel('other')).toBeNull();
  expect(pageTypeLabel(undefined)).toBeNull();
  expect(pageTypeLabel('toString')).toBeNull();
});

describe('search status line', () => {
  it('accounts for the council list as well as the full text results', () => {
    expect(searchStatus(1, 0)).toBe('1 matching council. No other pages match.');
    expect(searchStatus(1, 33)).toBe('1 matching council and 33 matching pages.');
    expect(searchStatus(3, 1)).toBe('3 matching councils and 1 matching page.');
    expect(searchStatus(12, 40)).toBe('12 matching councils (the first five listed) and 40 matching pages.');
    expect(searchStatus(0, 8)).toBe('8 matching pages.');
    expect(searchStatus(null, 8)).toBe('8 matching pages.');
    expect(searchStatus(0, 0)).toBe('No matching pages or councils. Try a council name or a broader topic.');
  });

  it('keeps the council count when page search fails to load', () => {
    expect(searchStatus(2, null)).toBe('2 matching councils. Page search could not load. Retry or use the council directory below.');
    expect(searchStatus(0, null)).toBe('Page search could not load. Retry or use the council directory below.');
  });

  it('never says no pages match while a council is listed', () => {
    for (const councils of [1, 2, 5, 6, 40]) expect(searchStatus(councils, 0)).not.toContain('No matching');
  });
});

describe('council list ranking', () => {
  it('puts the exact name first, then starts, then word starts, then the rest, each A to Z', () => {
    const rows = ['North York Moors', 'Yorkshire Dales', 'York', 'East Riding of Yorkshire', 'New York', 'Beyork'].map(name => ({ name }));
    expect(rankCouncils('york', rows).map(row => row.name)).toEqual([
      'York', 'Yorkshire Dales', 'East Riding of Yorkshire', 'New York', 'North York Moors', 'Beyork',
    ]);
  });

  it('ranks real councils for a few queries', () => {
    const names = (query: string) => rankCouncils(query, councilIndex().filter(row => matchesCouncil(query, row.name, row.officialName))).map(row => row.name);
    expect(names('york')[0]).toBe('York');
    expect(names('bur')[0]).toMatch(/^Bur/);
    expect(councilRank('hampton', 'Wolverhampton')).toBe(3);
    expect(councilRank('lynn', "King's Lynn and West Norfolk")).toBe(2);
  });
});
