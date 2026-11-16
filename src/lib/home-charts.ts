import { defineFigures, line } from '../vendor/estate-kit/dist/src/index.js';
import { CURRENT_YEAR, loadYear, yearLabel } from './council-tax';
import { councilTaxSource } from './sources';

/**
 * Keep every plotted annual value; label the first, middle and last year.
 * The kit's line chart has no option for this, so the tick labels are thinned in its
 * output. If the kit changes its tick markup the count no longer matches and the build stops.
 */
export function spaceYearLabels(svg: string, expected: number): string {
  const ticks = /<text\b[^>]*>\d{4}\/\d{2}<\/text>/g;
  const labels = [...svg.matchAll(ticks)];
  if (labels.length !== expected) throw new Error(`Homepage history chart: expected ${expected} year labels, found ${labels.length}`);
  const kept = new Set([0, Math.floor((labels.length - 1) / 2), labels.length - 1]);
  let index = 0;
  return svg.replace(ticks, node => kept.has(index++) ? node : '');
}

export function homeCharts() {
  const data = loadYear(CURRENT_YEAR);
  const history = data.england.history;
  if (!history) return null;
  const source = councilTaxSource(CURRENT_YEAR, history.table);
  const kitSource = {publisher: source.publisher, title: source.title, table: source.table, edition: source.date ?? yearLabel(CURRENT_YEAR), url: source.url};
  const points = history.rows.filter(row => typeof row.pounds === 'number').map(row => ({label: yearLabel(row.year), value: row.pounds!}));
  const set = defineFigures({
    'england.history': {kind: 'series', axis: 'category', label: 'England', unit: 'gbp', dp: 0, points, source: kitSource},
  });
  const historyChart = line({set, series: ['england.history'], sourcePlacement: 'html', alt: `Published average Band D in England, ${points[0].label} to ${points.at(-1)!.label}. Every annual value is in the accompanying table.`});
  historyChart.svg = spaceYearLabels(historyChart.svg, points.length);
  return {
    history: historyChart,
    source,
  };
}
