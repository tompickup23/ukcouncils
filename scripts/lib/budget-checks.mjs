import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
/** Source presence and exact printed anchors in the generated profiles. */
export function budgetChecks(root, dist) {
  const json = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
  const budget = json('data/budget/ra-2026-27.json');
  const tax = json('data/council-tax/england-2026-27.json');
  const links = json('data/links/ukcounciltax-budget.json');
  const registry = json('data/registry/councils.json');
  const failures = [];
  const check = (ok, label) => {if (!ok) failures.push(label);};
  const counts = {billing: 0, county: 0};
  for (const council of Object.values(registry.councils).filter(c => tax.authorities[c.gss])) {
    const html = readFileSync(join(dist, 'councils', council.slug, 'index.html'), 'utf8');
    const row = budget.councils[council.gss];
    const available = row.status === 'available';
    const county = available && row.class === 'SD';
    const where = council.slug;
    const sectionCount = (html.match(/data-profile-section="budget"/g) ?? []).length;
    const countyCount = (html.match(/id="county-budget"/g) ?? []).length;
    counts.billing += sectionCount; counts.county += countyCount;
    check(sectionCount === Number(available), `Budget presence ${where}`);
    check(countyCount === Number(county), `County presence ${where}`);
    const contents = /<nav\b[^>]*aria-label="On this page"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
    for (const [id, expected] of [['budget', available], ['county-budget', county]]) {
      check((contents.match(new RegExp(`href="#${id}"`, 'g')) ?? []).length === Number(expected), `Budget contents ${id} ${where}`);
    }
    const start = html.indexOf('<section class="section" id="budget"');
    let end = start, depth = 0;
    if (start >= 0) for (const tag of html.slice(start).matchAll(/<section\b[^>]*>|<\/section>/g)) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {end = start + tag.index + tag[0].length; break;}
    }
    const content = start < 0 ? '' : html.slice(start, end);
    if (!available) {
      check(!/budget-heading|billing-budget|Play the budget game/.test(html), `No return placeholder ${where}`);
      continue;
    }
    check(content.includes(`${tax.authorities[council.gss].name} council budget for 2026/27`), `Budget display name ${where}`);
    check(html.includes(`href="${links.urlsByGss[council.gss]}"`), `Verified game URL ${where}`);
    check(!/<script|astro-island/.test(content), `Budget client script ${where}`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    check(new Set(ids).size === ids.length, `Duplicate ids ${where}`);
    if (row.notes.raPart1.includes('[note 4]')) check((content.match(/MHCLG note 4:/g) ?? []).length === 2, `Note 4 beside both rows ${where}`);
    if (row.notes.raPart1.includes('[note 8]')) check(/<\/table><\/div>\s*<p[^>]*data-note8/.test(content), `Note 8 under funding ${where}`);
    const hasReserves = ['resoth_strt', 'resoth_end', 'resunall_strt', 'resunall_end'].some(key => row.values[key] !== null && row.values[key] !== 0);
    check(content.includes('id="billing-budget-reserves"') === hasReserves, `Reserves subsection presence ${where}`);
    if (!hasReserves && !county) check(!content.includes('planned other earmarked and unallocated reserve balances'), `No empty reserves table ${where}`);
    if (hasReserves) check(content.includes('It is not possible to identify usable revenue reserves in the current release.'), `Reserves caveat ${where}`);
    if (where === 'burnley') for (const value of ['£17,246,000', '£2,759,432,000', 'minus £343,000', 'minus £426,000', 'Lancashire County Council budget']) check(content.includes(value), `Burnley anchor ${value}`);
    if (where === 'birmingham') check(content.includes('£2,700,482,000'), 'Birmingham service total');
    if (where === 'dorset') check(content.includes('Dorset UA'), 'Dorset source name');
    if (where === 'isles-of-scilly') {check(content.includes('£756,000'), 'Scilly education'); check(!content.includes('data-dsg'), 'Scilly zero DSG omitted');}
    if (where === 'runnymede') check(/Retained business rates\s*<\/th>\s*<td[^>]*>970<\/td>\s*<td[^>]*>Deduct<\/td>\s*<td[^>]*>£880,000/.test(content), 'Runnymede deduction');
  }
  const billing = Object.keys(tax.authorities).filter(gss => budget.councils[gss].status === 'available');
  check(counts.billing === billing.length && counts.billing === 287, 'Budget total coverage');
  check(counts.county === billing.filter(gss => budget.councils[gss].class === 'SD').length && counts.county === 160, 'County total coverage');
  check(!existsSync(join(dist, 'councils/lancashire/index.html')), 'No standalone county page');
  return {failures, counts};
}
