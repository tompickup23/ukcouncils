import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {CURRENT_YEAR, yearLabel} from './council-tax';
import {councilTaxSource, type SourceRef} from './sources';
const national = JSON.parse(readFileSync(join(process.cwd(), `data/budget/table-10-${CURRENT_YEAR}.json`), 'utf8'));

export interface BudgetCouncil {
  name: string;
  class: string;
  status: 'available' | 'no return';
  countyCode: string | null;
  notes: Record<string, string>;
  values: Record<string, number | null>;
}
interface BudgetField {
  line: number;
  label: string;
  heading: string;
  source: 'raPart1' | 'raPart2' | 'raGrants';
  unit: 'GBP thousand';
  recordType: 'observation';
}
interface BudgetData {
  year: string;
  councils: Record<string, BudgetCouncil>;
  groups: {id: string; label: string; subLines: string[]}[];
  fields: Record<string, BudgetField>;
  sources: Record<BudgetField['source'], {publisher: string; title: string; url: string; fileUrl: string; published: string; retrieved: string; licence: string; sha256: string; tables: string[]}>;
  sourceNotes: Record<BudgetField['source'], Record<string, string>>;
}
export const budget = JSON.parse(readFileSync(join(process.cwd(), `data/budget/ra-${CURRENT_YEAR}.json`), 'utf8')) as BudgetData;
if (budget.year !== national.year || budget.year !== CURRENT_YEAR) throw new Error('Budget and council tax editions differ');
export const budgetYear = yearLabel(budget.year);
export const RESERVES_CAVEAT = 'It is not possible to identify usable revenue reserves in the current release.';
export const REVENUE_RELEASE = 'https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2026-to-2027-budget';

export function budgetSource(key: BudgetField['source'] = 'raPart1', method?: string): SourceRef {
  const source = budget.sources[key];
  return {publisher: source.publisher, title: source.title, url: source.fileUrl, table: source.tables[0], date: source.published, method};
}
export const billSource: SourceRef = {
  ...councilTaxSource(CURRENT_YEAR, 'Table 10, Data_Billing and Precepting_Bodies'),
  title: national.sources.components.title,
  url: national.sources.components.fileUrl,
};

/** Unit conversion only: preserve each printed integer and its source unit. */
export function budgetMoney(thousands: number | null): string {
  if (thousands === null) return 'n/a';
  return new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP', maximumFractionDigits: 0}).format(thousands * 1000);
}
export function observation(council: BudgetCouncil, id: string) {
  const field = budget.fields[id];
  if (!field || !(id in council.values)) throw new Error(`Missing budget field ${id}`);
  return {id, ...field, value: council.values[id], recordType: 'observation' as const};
}
export function services(council: BudgetCouncil) {
  return budget.groups.map(group => ({...observation(council, group.id), label: group.label, subLines: group.subLines}));
}
export function budgetFor(gss: string) {
  const council = budget.councils[gss];
  if (!council) throw new Error(`Missing RA authority ${gss}`);
  const county = council.countyCode ? budget.councils[council.countyCode] : null;
  if (council.countyCode && (!county || county.class !== 'SC')) throw new Error(`Missing RA county for ${gss}`);
  return {council, county};
}
function sum(council: BudgetCouncil, ids: string[]): number | null {
  const values = ids.map(id => observation(council, id).value);
  return values.some(v => v === null) ? null : values.reduce<number>((total, value) => total + value!, 0);
}
export const FINANCING_IDS = ['grantinaef', 'trnsreorg', 'appressch', 'appresdsg', 'appresph', 'appresoth', 'appresunall', 'grantrsg', 'grantpol', 'retainnndr', 'colfunct', 'othinc'];
/** A signed contribution to revenue expenditure, not an absolute-value sum.
 * Display magnitudes with an explicit add/deduct direction, preserving the identity.
 */
export function funding(council: BudgetCouncil) {
  const groups: [string, string[], number][] = [
    ['Specific grants inside AEF', ['grantinaef'], -1],
    ['Revenue Support Grant', ['grantrsg'], -1],
    ['Retained business rates', ['retainnndr'], -1],
    ['Council tax requirement', ['ctrtot'], 1],
    ['Use of or addition to reserves', ['appressch', 'appresdsg', 'appresph', 'appresoth', 'appresunall'], -1],
    ['Other items', ['trnsreorg', 'grantpol', 'colfunct', 'othinc'], -1],
  ];
  return groups.map(([label, ids, multiplier]) => {
    const printed = sum(council, ids);
    const value = printed === null ? null : printed * multiplier;
    return {label, value, recordType: 'calculation' as const, unit: 'GBP thousand' as const,
      inputIds: ids, lines: ids.map(id => budget.fields[id].line),
      method: `${multiplier === -1 ? 'Reverse the sign of' : 'Use'} ${ids.length > 1 ? 'the sum of ' : ''}RA lines ${ids.map(id => budget.fields[id].line).join(', ')}`};
  });
}
export function nonRingfencedReserves(council: BudgetCouncil) {
  return (['strt', 'end'] as const).map(period => {
    const inputIds = [`resoth_${period}`, `resunall_${period}`];
    return {period, value: sum(council, inputIds), recordType: 'calculation' as const,
      unit: 'GBP thousand' as const, inputIds, method: 'Sum of RA Part 2 lines 1015 and 1016'};
  });
}
