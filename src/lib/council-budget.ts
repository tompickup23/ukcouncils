import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {budget, budgetSource, REVENUE_RELEASE, type BudgetCouncil} from './budget';
import {CURRENT_YEAR, loadYear} from './council-tax';
import type {Council} from './registry';
import type {SourceRef} from './sources';

export interface CouncilBudget {
  council: BudgetCouncil;
  name: string;
  county: {council: BudgetCouncil; name: string} | null;
  sources: SourceRef[];
  gameUrl: string | null;
}

export const reservesSource: SourceRef = {
  publisher: budget.sources.raPart2.publisher,
  title: `Local authority revenue expenditure and financing: ${budget.year.replace('-', ' to 20')} budget, England`,
  url: REVENUE_RELEASE,
  table: 'Reserves section',
  date: budget.sources.raPart2.published,
};

/** Exact code joins only. A missing return suppresses the complete section. */
export function councilBudget(council: Council): CouncilBudget | null {
  const current = loadYear(CURRENT_YEAR);
  const tax = current.authorities[council.gss];
  if (council.country !== 'England' || !tax) return null;
  const row = budget.councils[council.gss];
  if (!row) throw new Error(`Missing current RA billing record ${council.gss}`);
  if (row.status === 'no return') return null;
  let county: CouncilBudget['county'] = null;
  if (tax.classCode === 'SD') {
    if (!row.countyCode || row.countyCode !== council.parentGss) throw new Error(`County join differs for ${council.gss}`);
    const countyRow = budget.councils[row.countyCode];
    const countyTax = current.counties[row.countyCode];
    if (!countyTax || countyRow?.class !== 'SC' || countyRow.status !== 'available') throw new Error(`Missing complete county return for ${council.gss}`);
    county = {council: countyRow, name: countyTax.name};
  } else if (row.countyCode) throw new Error(`Unexpected county on ${council.gss}`);
  const sources = [budgetSource()];
  if ((row.values.grantindsg ?? 0) > 0) sources.push(budgetSource('raGrants'));
  sources.push(budgetSource('raPart2'), reservesSource);
  if (county && (county.council.values.grantindsg ?? 0) > 0) sources.push(budgetSource('raGrants'));
  const path = join(process.cwd(), 'data/links/ukcounciltax-budget.json');
  const links = JSON.parse(readFileSync(path, 'utf8')).urlsByGss as Record<string, string>;
  return {council: row, name: tax.name, county, sources, gameUrl: links[council.gss] ?? null};
}
