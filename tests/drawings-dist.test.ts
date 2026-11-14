import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// NV8 and NV12 on the built pages: where each drawing sits and what it carries.
const DIST = join(process.cwd(), 'dist');
const built = existsSync(join(DIST, 'councils/burnley/index.html'));
const read = (path: string) => readFileSync(join(DIST, path), 'utf8');

describe.skipIf(!built)('built drawings', () => {
  it('draw the class map on /councils/ after the picker, with a skip link past its 296 links', () => {
    const html = read('councils/index.html');
    const picker = html.indexOf('id="council-directory-caption"');
    const map = html.indexOf('data-ek-area-map');
    expect(picker).toBeGreaterThan(0);
    expect(map).toBeGreaterThan(picker);
    const figure = html.slice(html.indexOf('<figure class="class-map-figure'), html.indexOf('</figure>', map));
    expect(figure.match(/class="ek-area-link"/g)).toHaveLength(296);
    expect(figure).toContain('data-pagefind-ignore');
    expect(figure).not.toContain('<script');
    const skip = html.indexOf('href="#class-map-after"');
    expect(skip).toBeGreaterThan(picker);
    expect(skip).toBeLessThan(map);
    expect(html.indexOf('id="class-map-after"')).toBeGreaterThan(map);
    expect(figure).toMatch(/Source: <a [^>]*>MHCLG, Council Tax levels set by local authorities in England 2026 to 2027<\/a>, Table 9/);
    const hrefs = [...figure.matchAll(/<a href="([^"]+)" role="link"/g)].map(m => m[1]);
    expect(new Set(hrefs).size).toBe(296);
    for (const href of hrefs) expect(existsSync(join(DIST, href, 'index.html')), href).toBe(true);
    expect(figure).toContain('aria-label="City of London: London borough or the City of London"');
    expect(figure).toContain('aria-label="Isles of Scilly: Unitary authority"');
    // Plates are off (kit 0.6.1): no opaque label over the map, and the class named once.
    expect(figure).not.toContain('data-ek-plate');
    expect(figure).not.toContain('Unitary authority; Unitary authority');
    expect(figure).not.toMatch(/[\u2013\u2014]| - /);
    const drawer = html.slice(html.indexOf('id="class-map-after"'), html.indexOf('</details>', html.indexOf('id="class-map-after"')));
    expect(drawer.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr>/g)).toHaveLength(296);
  });

  it('draw the service lines on each profile with a budget, before the drawer that holds the table', () => {
    const slugs = readdirSync(join(DIST, 'councils'), { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(DIST, 'councils', d.name, 'index.html'))).map(d => d.name);
    let billing = 0, county = 0;
    for (const slug of slugs) {
      const html = read(`councils/${slug}/index.html`);
      if (!html.includes('data-budget-drawer')) { expect(html, slug).not.toContain('data-service-bars'); continue; }
      const bars = [...html.matchAll(/data-service-bars/g)].map(m => m.index!);
      const drawer = html.indexOf('data-budget-drawer');
      const countyDrawer = html.indexOf('data-county-budget-drawer');
      expect(bars.filter(i => i < drawer), slug).toHaveLength(1);
      billing++;
      if (countyDrawer > 0) { expect(bars.filter(i => i > countyDrawer), slug).toHaveLength(1); county++; }
      expect(bars, slug).toHaveLength(countyDrawer > 0 ? 2 : 1);
    }
    expect(billing).toBe(287);
    expect(county).toBe(160);
  });
});
