import { defineFigures, rankedBars, type ChartOutput } from '../vendor/estate-kit/dist/src/index.js';
import { budgetMoney, budgetSource, budgetYear, services, type BudgetCouncil } from './budget';
import { longDate } from './sources';

/**
 * Service expenditure as ranked bars (NV12, X1 of 14 November 2026). The rows are
 * exactly the rows of the service table beside the drawing: the RA return's service
 * headings, in the return's own line order, with a null or a zero left out as the
 * table leaves it out. Nothing is sorted, summed or derived. A pound figure is the
 * printed whole thousands times 1,000, the conversion the table already makes, and a
 * net income draws from zero to the left and reads "minus" as the table does.
 *
 * The total (line 799) is not a bar: it is the sum of the others, and a bar for it
 * would compare a whole with its parts.
 */
const present = (value: number | null): value is number => value !== null && value !== 0;

export function serviceRows(council: BudgetCouncil) {
  return services(council).filter(row => present(row.value));
}

export function serviceBars(council: BudgetCouncil, name: string): ChartOutput | null {
  const rows = serviceRows(council);
  if (!rows.length) return null;
  const site = budgetSource();
  const source = { publisher: site.publisher, title: site.title, table: site.table, edition: longDate(site.date) ?? budgetYear, url: site.url };
  const set = defineFigures(Object.fromEntries(rows.map(row => [`service.${row.id}`, {
    kind: 'value', label: 'Net current expenditure', name: row.label, unit: 'gbp', dp: 0,
    value: row.value! * 1000, source,
  }])));
  return rankedBars({
    set,
    rows: rows.map(row => ({ figure: `service.${row.id}` })),
    title: `${name}: net current expenditure by service, ${budgetYear}`,
    classLabel: `MHCLG service headings for ${name}, in the order of the RA return`,
    basis: `budget for ${budgetYear}, in pounds converted from printed whole thousands`,
    sourcePlacement: 'html',
    alt: `Bars from zero of ${name}'s net current expenditure by MHCLG service heading, ${budgetYear}, in the order of the RA return. ${rows.map(row => `${row.label}: ${row.value! < 0 ? `minus ${budgetMoney(-row.value!)}` : budgetMoney(row.value)}`).join('; ')}.`,
  });
}
