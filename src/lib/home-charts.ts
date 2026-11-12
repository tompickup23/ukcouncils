import { defineFigures, line, zeroBar } from '../vendor/estate-kit/dist/src/index.js';
import { BANDS, CURRENT_YEAR, loadYear, yearLabel } from './council-tax';
import { councilTaxSource } from './sources';

/** Keep every plotted annual value; label the first, middle and last year. */
function spaceYearLabels(svg: string): string {
  const ticks = /<text\b[^>]*>\d{4}\/\d{2}<\/text>/g;
  const labels = [...svg.matchAll(ticks)];
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
  const burnley = data.authorities['E07000117'];
  const pendle = data.authorities['E07000122'];
  const bandSource = councilTaxSource(CURRENT_YEAR, data.source.bandTable);
  const bandKitSource = {publisher: bandSource.publisher, title: bandSource.title, table: bandSource.table, edition: bandSource.date ?? yearLabel(CURRENT_YEAR), url: bandSource.url};
  const set = defineFigures({
    'england.history': {kind: 'series', axis: 'category', label: 'England', unit: 'gbp', dp: 0, points, source: kitSource},
    'england.recent': {kind: 'series', axis: 'category', label: 'Recent England average Band D', unit: 'gbp', dp: 0, points: points.slice(-3), source: kitSource},
    'burnley.bands': {kind: 'series', axis: 'category', label: 'Published Burnley bands', unit: 'gbp', dp: 2, points: BANDS.filter(b => burnley.bands[b] !== null).map(b => ({label: b, value: burnley.bands[b]})), source: bandKitSource},
    'district.compare': {kind: 'series', axis: 'category', label: 'Area Band D, two Lancashire shire districts', unit: 'gbp', dp: 2, points: [burnley, pendle].map(row => ({label: row.name, value: row.bands.D})), source: bandKitSource},
  });
  const historyChart = line({set, series: ['england.history'], sourcePlacement: 'html', alt: `Published average Band D in England, ${points[0].label} to ${points.at(-1)!.label}. Every annual value is in the accompanying table.`});
  historyChart.svg = spaceYearLabels(historyChart.svg);
  return {
    history: historyChart,
    source,
    thumbs: ['burnley.bands', 'district.compare', 'england.recent'].map(figure => zeroBar({set, figure, template: 'thumb'}).svg),
  };
}
