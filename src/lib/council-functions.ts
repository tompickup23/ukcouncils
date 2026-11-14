import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Council} from './registry';
import {CURRENT_YEAR, loadYear, type Authority} from './council-tax';
import type {SourceRef} from './sources';

const pinned = JSON.parse(readFileSync(resolve(process.cwd(), 'data/services/functions.json'), 'utf8')) as {
  source: SourceRef;
  excludedGss: string[];
  rows: {label: string; tier: 'county' | 'district'; page: number}[];
};
export const functionsSource = (): SourceRef => pinned.source;

/** Selected functions only. Do not infer special authorities or future structures. */
export function functionsFor(council: Council, tax: Authority) {
  if (council.country !== 'England' || pinned.excludedGss.includes(council.gss)) return null;
  if (!['SD', 'UA', 'MD', 'ILB', 'OLB'].includes(tax.classCode)) return null;
  const district = tax.classCode === 'SD';
  const county = district && council.parentGss ? loadYear(CURRENT_YEAR).counties[council.parentGss] : null;
  if (district && !county) return null;
  return pinned.rows.map(row => ({
    label: row.label,
    authority: district && row.tier === 'county' ? `${county!.name} County Council` : tax.name,
  }));
}
