import { expect, it } from 'vitest';
import { homeCharts } from '../src/lib/home-charts';
import { CURRENT_YEAR, loadYear } from '../src/lib/council-tax';
import { NAV_GROUPS, FOOTER_LINKS } from '../src/lib/site';
it('draws every held England history value without altering the series', () => {
  const chart = homeCharts()!;
  for (const row of loadYear(CURRENT_YEAR).england.history!.rows) {
    if (typeof row.pounds === 'number') expect(chart.history.table).toContain(row.pounds.toLocaleString('en-GB'));
  }
  expect(chart.thumbs).toHaveLength(3);
  expect(chart.history.svg.match(/>\d{4}\/\d{2}<\/text>/g)).toHaveLength(3);
});
it('keeps every header destination and every band accessible in the footer', () => {
  const header = NAV_GROUPS.flatMap(group => group.items);
  expect(header.length).toBeLessThan(20);
  const footer = new Set(FOOTER_LINKS.map(link => link.href));
  for (const link of header) expect(footer.has(link.href)).toBe(true);
  for (const band of 'abcdefgh') expect(footer.has(`/council-tax/band-${band}/`)).toBe(true);
});
