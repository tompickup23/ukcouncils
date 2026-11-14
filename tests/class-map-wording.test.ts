import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { heldWording } from '../scripts/lib/held-wording.mjs';

// The class map names MHCLG's "Unitary authority" class. The held wording gate masks that
// label only in the map's exact markup; any other wording in the map still trips it.
const page = 'dist/councils/index.html';
// Read lazily: a describe body runs at collection even when skipped, and CI's validate job
// runs before any build, so dist/ is absent there.
const built = existsSync(page);
describe.skipIf(!built)('the class map and the held wording gate', () => {
  const html = built ? readFileSync(page, 'utf8') : '';
  it('passes with the class label as drawn', () => {
    expect(html).toContain('<td>Unitary authority</td>');
    expect(heldWording(html)).toBe(false);
  });
  it('still fails on any other unitary or reorganisation wording inside the map', () => {
    const svgEnd = html.indexOf('</svg>', html.indexOf('data-ek-area-map'));
    for (const text of ['a new unitary council', 'reorganisation', 'Unitary authority from 2028']) {
      expect(heldWording(`${html.slice(0, svgEnd)}<text>${text}</text>${html.slice(svgEnd)}`), text).toBe(true);
    }
    expect(heldWording(html.replace('<td>Unitary authority</td>', '<td>Unitary authority, proposed</td>'))).toBe(true);
    expect(heldWording(html.replace('with the unitary authorities, and the map', 'with the unitary authorities created in 2026, and the map'))).toBe(true);
  });
});
