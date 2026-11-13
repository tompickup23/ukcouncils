import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'ultrahtml';
import { nearbyCouncils, segmentsMeet, touchingAreas } from '../src/lib/council-neighbours';
import { boundaryAreas } from '../src/lib/boundaries';
import { councilPages, councilPath } from '../src/lib/paths';
import dryRun from '../docs/NEARBY-AND-ALIKE-DRY-RUN-2026-11-13.json';

const pages = councilPages();
const paths = new Set(pages.map(({ council }) => councilPath(council)));

describe('nearby and alike', () => {
  it('reproduces the independent dry run on the pinned boundary file for every profile', () => {
    expect(createHash('sha256').update(readFileSync('data/geography/lad26-england.geojson')).digest('hex')).toBe(dryRun.sourceSha256);
    expect(dryRun.councils).toHaveLength(pages.length);
    for (const { council } of pages) {
      const expected = dryRun.councils.find(row => row.gss === council.gss)!;
      const actual = nearbyCouncils(council);
      expect(actual.neighbours.map(other => other.gss).sort(), council.slug).toEqual(expected.boundaryGss);
      expect(actual.sameCounty.map(other => other.gss).sort(), council.slug).toEqual(expected.sameCountyGss);
      expect(actual.neighbours).toHaveLength(expected.boundaryCount);
      expect(actual.sameCounty).toHaveLength(expected.sameCountyCount);
      if (actual.county) expect(actual.similar?.councils).toEqual(actual.sameCounty);
    }
  });

  it('has reciprocal boundaries, resolving links and no self links or money fields', () => {
    const touching = touchingAreas();
    for (const { council } of pages) {
      const nearby = nearbyCouncils(council);
      for (const other of nearby.neighbours) expect(touching.get(other.gss)?.has(council.gss)).toBe(true);
      for (const group of [nearby.neighbours, nearby.sameCounty, nearby.similar?.councils ?? []]) {
        expect(new Set(group.map(other => other.gss)).size).toBe(group.length);
        for (const other of group) {
          expect(other.gss).not.toBe(council.gss);
          expect(paths.has(other.href)).toBe(true);
          expect(Object.keys(other).sort()).toEqual(['gss', 'href', 'name', 'type']);
        }
      }
    }
  });

  it('distinguishes island gaps from a missing boundary and keeps London neighbours', () => {
    const empty = pages.filter(({ council }) => nearbyCouncils(council).neighbours.length === 0);
    expect(empty.map(({ council }) => council.slug).sort()).toEqual(['isle-of-wight', 'isles-of-scilly']);
    const city = pages.find(({ council }) => council.slug === 'city-of-london')!;
    expect(nearbyCouncils(city.council).neighbours.map(other => other.name)).toEqual(['Camden', 'Hackney', 'Islington', 'Tower Hamlets', 'Westminster']);
    expect(() => nearbyCouncils({ ...city.council, gss: 'UNKNOWN' })).toThrow('No pinned boundary');
  });
});

describe('touching outlines', () => {
  it('treats crossing, end to end and point on segment contact as meeting, and a gap as apart', () => {
    expect(segmentsMeet([0, 0], [10, 10], [0, 10], [10, 0])).toBe(true);
    expect(segmentsMeet([0, 0], [10, 0], [10, 0], [20, 5])).toBe(true);
    expect(segmentsMeet([0, 0], [10, 0], [5, 0], [5, 9])).toBe(true);
    expect(segmentsMeet([0, 0], [10, 0], [4, 0], [20, 0])).toBe(true);
    expect(segmentsMeet([0, 0], [10, 0], [11, 0], [20, 0])).toBe(false);
    expect(segmentsMeet([0, 0], [10, 0], [5, 1], [5, 9])).toBe(false);
    expect(segmentsMeet([0, 0], [10, 10], [1, 0], [11, 10])).toBe(false);
  });

  it('keeps every pair that shares a point and adds the pairs whose simplified outlines cross', () => {
    const names = new Map(boundaryAreas().map(area => [area.properties.LAD26CD, area.properties.LAD26NM]));
    const points = new Map<string, Set<string>>();
    for (const area of boundaryAreas()) {
      const polygons = area.geometry.type === 'Polygon' ? [area.geometry.coordinates] : area.geometry.coordinates;
      for (const polygon of polygons) for (const ring of polygon) for (const [x, y] of ring) {
        const key = `${x.toFixed(5)},${y.toFixed(5)}`;
        points.set(key, (points.get(key) ?? new Set()).add(area.properties.LAD26CD));
      }
    }
    const shared = new Set<string>();
    for (const codes of points.values()) for (const a of codes) for (const b of codes) if (a < b) shared.add(`${a} ${b}`);
    const touching = touchingAreas();
    const pairs = new Set<string>();
    for (const [a, others] of touching) for (const b of others) if (a < b) pairs.add(`${a} ${b}`);
    for (const pair of shared) expect(pairs.has(pair), pair).toBe(true);
    const crossingOnly = [...pairs].filter(pair => !shared.has(pair))
      .map(pair => pair.split(' ').map(code => names.get(code)).sort().join(' and ')).sort();
    expect(crossingOnly).toEqual([
      'Bexley and Sevenoaks',
      'Castle Point and Thurrock',
      'Hammersmith and Fulham and Richmond upon Thames',
      'Kensington and Chelsea and Wandsworth',
      'North Kesteven and South Holland',
      'North Northamptonshire and South Kesteven',
    ]);
    expect(pairs.size).toBe(753);
  });
});

describe.skipIf(!existsSync('dist/councils'))('built onward links', () => {
  it('keeps every link visible without scripts, excludes it from search and prints no financial comparison', () => {
    for (const { council } of pages) {
      const html = readFileSync(join('dist/councils', council.slug, 'index.html'), 'utf8');
      // Parse the section separately so every link is tested in its static reading path.
      const section = html.match(/<section\b[^>]*data-nearby-councils[\s\S]*?<\/section>/)?.[0];
      expect(section, council.slug).toBeTruthy();
      expect(section).toContain('id="similar"');
      expect(section).toContain('data-pagefind-ignore');
      expect(section).not.toMatch(/<details|<script|\shidden(?:\s|[=>])|£|data-figure/);
      const tree = parse(section!);
      const found: string[] = [];
      const visit = (node: typeof tree) => {
        if (node.attributes?.['data-nearby-gss']) {
          const href = node.attributes.href;
          found.push(href);
          expect(paths.has(href), `${council.slug}: ${href}`).toBe(true);
          expect(existsSync(join('dist', href, 'index.html'))).toBe(true);
          expect(href).not.toBe(councilPath(council));
        }
        node.children?.forEach(visit);
      };
      visit(tree);
      const nearby = nearbyCouncils(council);
      expect(found).toEqual([...nearby.neighbours, ...(nearby.county ? nearby.sameCounty : nearby.similar?.councils ?? [])].map(other => other.href));
      expect(section).not.toContain('href="/councils/lancashire/"');
    }
  });
});
