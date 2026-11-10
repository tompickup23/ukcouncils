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
/**
 * The comparison group. MHCLG's inner and outer London classes are one group, as on the
 * ranked pages and the area averages: the same structure, the same Greater London Authority precept.
 */
export function compareGroup(classCode: string): string {
  return classCode === 'ILB' || classCode === 'OLB' ? 'london' : classCode;
}
/** The group in words, singular, for "Choose another …". */
export function groupLabel(row: Pick<TaxRow, 'classCode' | 'classLabel'>): string {
  return compareGroup(row.classCode) === 'london' ? 'London borough or the City of London' : row.classLabel.toLowerCase();
}
const article = (label: string) => (/^[aeiou]/i.test(label) ? 'an ' : 'a ') + label;
const shownYear = (year: string) => year.replace('-', '/');
/** Reads a request as a person might type or share it: band in any case, the year with a slash or a hyphen. */
export function normaliseState(raw: {a?: string | null; b?: string | null; band?: string | null; year?: string | null}, currentYear: string): ComparisonState {
  return {
    a: (raw.a ?? '').trim().toLowerCase(),
    b: (raw.b ?? '').trim().toLowerCase(),
    band: (raw.band || 'D').trim().toUpperCase(),
    year: (raw.year || currentYear).trim().replace('/', '-'),
  };
}
/** True when this council holds every band for the year, so the year can be offered. */
export function heldYear(row: TaxRow | undefined, year: string): boolean {
  return !row || TAX_BANDS.some(band => validPence(row.years[year]?.[band]));
}
export function compareTax(rows: TaxRow[], state: ComparisonState, years: readonly string[]): ComparisonResult {
  if (!years.includes(state.year)) return {ok: false, message: 'Choose an available financial year.'};
  if (!(TAX_BANDS as readonly string[]).includes(state.band)) return {ok: false, message: 'Choose a band from A to H.'};
  const a = rows.find(row => row.slug === state.a);
  const b = rows.find(row => row.slug === state.b);
  if (a && !state.b) return {ok: false, message: `Now choose another ${groupLabel(a)} to compare with ${a.name}.`};
  if (!a || !b) return {ok: false, message: 'Choose two councils from the lists.'};
  if (a.gss === b.gss) return {ok: false, message: 'Choose two different councils.'};
  if (a.basis !== b.basis) return {ok: false, message: 'Area charges and individual council shares cannot be mixed.'};
  if (compareGroup(a.classCode) !== compareGroup(b.classCode)) return {ok: false, message: `${b.name} is ${article(b.classLabel.toLowerCase())} and ${a.name} is ${article(a.classLabel.toLowerCase())}. Compare works within one type of council, so choose another ${groupLabel(a)}.`};
  const band = state.band as TaxBand;
  const aPence = a.years[state.year]?.[band];
  const bPence = b.years[state.year]?.[band];
  if (!validPence(aPence) || !validPence(bPence)) {
    const missing = [validPence(aPence) ? null : a.name, validPence(bPence) ? null : b.name].filter(Boolean);
    return {ok: false, message: `No published Band ${band} figure for ${shownYear(state.year)} is held for ${missing.join(' or ')} under its current authority code. Figures are not carried across a change of code. Choose another year.`};
  }
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

/** The provenance of one year's published band table, as the pages print it. */
export interface ExportSource { publisher: string; title: string; table?: string; url: string; date?: string | null; revised: string | null; licence: string; licenceUrl: string; files: {url: string; sha256: string}[] }
