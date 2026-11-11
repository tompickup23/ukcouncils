import { describe, expect, it } from 'vitest';
import { councilIndex } from '../src/lib/council-index';
import { councilPages, councilPath, programmaticPaths } from '../src/lib/paths';
import { matchesCouncil, normalise } from '../src/lib/council-search';
import { pageTypeFor } from '../src/lib/page-type';
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
  expect(pageTypeFor('/councils/')).toBe('hub');
  expect(pageTypeFor('/404/')).toBe('other');
});
