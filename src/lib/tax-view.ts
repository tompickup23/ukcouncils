/** Browser-safe council tax contract. Values are integer pence, never inferred bands. */
export const TAX_BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type TaxBand = typeof TAX_BANDS[number];
export interface TaxRow {
  slug: string; gss: string; name: string; region: string; classCode: string; classLabel: string;
  basis: 'area-average';
  years: Record<string, Partial<Record<TaxBand, number>>>;
}
export interface ComparisonState { a: string; b: string; band: string; year: string }
export type ComparisonResult = { ok: true; a: TaxRow; b: TaxRow; band: TaxBand; year: string; aPence: number; bPence: number; differencePence: number } | { ok: false; message: string };
export function validPence(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
export function compareTax(rows: TaxRow[], state: ComparisonState, years: readonly string[]): ComparisonResult {
  if (!years.includes(state.year)) return {ok: false, message: 'Choose an available financial year.'};
  if (!(TAX_BANDS as readonly string[]).includes(state.band)) return {ok: false, message: 'Choose a band from A to H.'};
  const a = rows.find(row => row.slug === state.a);
  const b = rows.find(row => row.slug === state.b);
  if (!a || !b) return {ok: false, message: 'Choose two councils from the lists.'};
  if (a.gss === b.gss) return {ok: false, message: 'Choose two different councils.'};
  if (a.classCode !== b.classCode || a.basis !== b.basis) return {ok: false, message: 'Choose two councils of the same type. Area charges and individual council shares cannot be mixed.'};
  const band = state.band as TaxBand;
  const aPence = a.years[state.year]?.[band];
  const bPence = b.years[state.year]?.[band];
  if (!validPence(aPence) || !validPence(bPence)) return {ok: false, message: 'A published figure for this band and year is unavailable for one of these areas. Choose another year or council.'};
  return {ok: true, a, b, band, year: state.year, aPence, bPence, differencePence: bPence - aPence};
}
const money = new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'});
export const moneyPence = (pence: number) => money.format(pence / 100);
export const monthlyPence = (pence: number) => Math.round(pence / 10);
export function comparisonQuery(state: ComparisonState): string {
  return new URLSearchParams({a: state.a, b: state.b, band: state.band, year: state.year}).toString();
}
/** A numeric sort is allowed only over a complete published class for that band/year. */
export function completeClass(rows: TaxRow[], code: string, year: string, band: TaxBand): boolean {
  const peers = rows.filter(row => row.classCode === code);
  return peers.length > 0 && peers.every(row => validPence(row.years[year]?.[band]));
}
