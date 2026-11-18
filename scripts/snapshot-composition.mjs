/** Explicit refresh only. Original responses stay in memory; only the allowlisted fields reach disk. */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';

if (!process.argv.includes('--write')) throw new Error('Use --write and review every snapshot difference before committing');
const date = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London'}).format(new Date());
const url = 'https://opencouncildata.co.uk/councils.php?model=E&y=0';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function fetchPage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return {sha256: hash(bytes), document: new JSDOM(bytes.toString()).window.document};
}
const tablePage = await fetchPage(url);
const table = [...tablePage.document.querySelectorAll('table')].find(table => table.textContent.includes('Control'));
if (!table) throw new Error('STOP: no control column');
const headings = [...table.querySelector('tr').children].map(cell => cell.textContent.trim());
if (JSON.stringify(headings) !== JSON.stringify(['Council', 'Control', 'Lab', 'Con', 'LD', 'Grn', 'Ref', 'Oth', 'Vac', 'Total'])) throw new Error('STOP: changed printed columns');
const rows = [];
for (const tr of [...table.querySelectorAll('tr')].slice(1)) {
  const cells = [...tr.children];
  const link = cells[0]?.querySelector('a');
  if (!link) continue;
  const identityUrl = new URL(link.getAttribute('href'), url).href;
  const id = new URL(identityUrl).searchParams.get('c');
  if (!/^\d+$/.test(id)) throw new Error('Invalid publisher council ID');
  const columns = Object.fromEntries(headings.slice(2).map((key, index) => {
    const value = cells[index + 2].textContent.trim();
    if (!/^\d+$/.test(value)) throw new Error(`Non-integer printed column ${id} ${key}`);
    return [key, Number(value)];
  }));
  rows.push({id, identityUrl, columns, control: cells[1].textContent.trim()});
}
for (let start = 0; start < rows.length; start += 6) {
  await Promise.all(rows.slice(start, start + 6).map(async row => {
    const page = await fetchPage(row.identityUrl);
    page.document.querySelectorAll('script, style').forEach(node => node.remove());
    const codes = [...new Set(page.document.body.textContent.match(/E(?:06|07|08|09|10)\d{6}(?!\d)/g) ?? [])];
    if (codes.length !== 1) throw new Error(`STOP: ambiguous identity ${row.id}`);
    row.gss = codes[0]; row.identitySha256 = page.sha256;
    page.document.defaultView.close();
  }));
  console.log(`Identities checked: ${Math.min(start + 6, rows.length)}/${rows.length}`);
}
const tax = JSON.parse(readFileSync('data/council-tax/england-2026-27.json'));
// Select only identity properties. The held registry field is never accessed.
const registry = JSON.parse(readFileSync('data/registry/councils.json')).councils;
const profiles = Object.entries(tax.authorities).map(([gss, value]) => ({gss, slug: registry[gss].slug, classCode: value.classCode}));
const profileCodes = new Set(profiles.map(row => row.gss));
const byCode = new Map(rows.map(row => [row.gss, row]));
const unmatched = profiles.filter(row => !byCode.has(row.gss));
const outOfScope = rows.filter(row => !profileCodes.has(row.gss));
if (rows.length !== 318 || byCode.size !== 318 || unmatched.length !== 1 || unmatched[0].slug !== 'isles-of-scilly' || outOfScope.length !== 23) throw new Error(`STOP: changed joins: ${rows.length} rows, ${profiles.length-unmatched.length} joined, ${outOfScope.length} outside`);
const home = await fetchPage('https://opencouncildata.co.uk/');
const lastUpdated = home.document.body.textContent.match(/Last Updated:\s*\d{2}-\d{2}-\d{4}/)?.[0];
if (!lastUpdated) throw new Error('Missing site last updated label');
const reuse = await fetchPage('https://opencouncildata.co.uk/aboutthissite.php');
if (![...reuse.document.querySelectorAll('a')].some(a => /creativecommons.org\/licenses\/by-sa\/4.0/.test(a.href))) throw new Error('Website licence not found');
const ukeRoot = process.env.UKELECTIONS_ROOT;
if (!ukeRoot) throw new Error('Set UKELECTIONS_ROOT to the read-only UK Elections checkout');
const git = args => execFileSync('git', ['-C', ukeRoot, ...args], {encoding: 'utf8'}).trim();
const commit = git(['rev-parse', 'origin/main']);
const statements = JSON.parse(git(['show', `${commit}:data/identity/council-2027-sources.json`]));
const bySlug = new Map(statements.councils.map(row => [row.slug, row]));
const names = {LAB: 'Labour', CON: 'Conservative', LD: 'Liberal Democrat', GRN: 'Green', REF: 'Reform UK'};
const keys = {LAB: 'Lab', CON: 'Con', LD: 'LD', GRN: 'Grn', REF: 'Ref'};
const checks = profiles.map(profile => {
  const row = byCode.get(profile.gss);
  const statement = bySlug.get(profile.slug)?.control;
  const eligible = statement?.value && statement?.quote && !Object.hasOwn(statement, 'basis');
  // Compare the compiler's record literally after expanding only documented party abbreviations.
  // Minority, mayoral and mixed labels are not silently converted to no overall control.
  const comparison = row ? names[row.control] ?? row.control : null;
  const outcome = !eligible || !row ? 'no council statement held' : comparison === statement.value ? 'agrees' : 'disagrees';
  const reconciles = row ? Object.entries(row.columns).filter(([key]) => key !== 'Total').reduce((sum, [, n]) => sum + n, 0) === row.columns.Total : false;
  const controlCheck1 = !row ? 'no row' : keys[row.control]
    ? row.columns[keys[row.control]] > row.columns.Total / 2 ? 'passes' : 'fails majority check'
    : /^(NOC|No overall control)$/i.test(row.control)
      ? Object.entries(row.columns).filter(([key]) => !['Total', 'Vac'].includes(key)).every(([, n]) => n <= row.columns.Total / 2) ? 'passes' : 'fails no overall control check'
      : row.control === '' ? 'empty publisher field' : 'unsupported publisher value';
  return {...profile, sourceId: row?.id ?? null, columns: row?.columns ?? null, reconciliation: !row ? 'no row' : reconciles ? 'reconciles' : 'fails', control: row?.control ?? null,
    controlCheck1, controlCheck2: {slug: profile.slug, outcome, commit},
    seatsAdmitted: reconciles && profile.slug !== 'city-of-london',
    controlAdmitted: reconciles && profile.slug !== 'city-of-london' && controlCheck1 === 'passes' && outcome !== 'disagrees'};
});
const totals = group => ({profiles: group.length, joined: group.filter(r => r.sourceId).length, reconciled: group.filter(r => r.reconciliation === 'reconciles').length,
  seatsAdmitted: group.filter(r => r.seatsAdmitted).length, controlAdmitted: group.filter(r => r.controlAdmitted).length,
  corroborated: group.filter(r => r.controlAdmitted && r.controlCheck2.outcome === 'agrees').length,
  singleSource: group.filter(r => r.controlAdmitted && r.controlCheck2.outcome === 'no council statement held').length,
  controlHeld: group.filter(r => !r.controlAdmitted).length,
  controlDisagrees: group.filter(r => r.controlCheck2.outcome === 'disagrees').length});
const source = {publisher: 'Open Council Data', title: 'English Council Compositions 2026', url, retrieved: date,
  siteLastUpdatedLabel: lastUpdated, originalSha256: tablePage.sha256, licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  reuseUrl: 'https://opencouncildata.co.uk/aboutthissite.php', reuseSha256: reuse.sha256, homepageSha256: home.sha256,
  controlHeading: headings[1], controlValues: [...new Set(rows.map(row => row.control))].sort(),
  transformation: 'Selected printed columns and control; exact GSS identities from each linked publisher ID. No original response retained. Share alike applies to the composition table only.'};
const snapshot = {source, rows};
const dryRun = {source, councilStatements: {repository: 'tompickup23/ukelections', path: 'data/identity/council-2027-sources.json', commit, checked_at: statements.checked_at},
  totals: totals(checks), byClass: Object.fromEntries([...new Set(profiles.map(p => p.classCode))].map(key => [key, totals(checks.filter(r => r.classCode === key))])),
  profiles: checks, unmatched, outOfScope,
  unmatchedSlugs: {profiles: profiles.filter(p => !bySlug.has(p.slug)).map(p => p.slug).sort(), councilStatements: statements.councils.filter(r => !profiles.some(p => p.slug === r.slug)).map(r => r.slug).sort()}};
const file = `data/elections/composition-${date}.json`;
const dryFile = `data/elections/composition-review-${date}.json`;
if (existsSync(file) || existsSync(dryFile)) throw new Error('Snapshot already exists; review before replacing it');
mkdirSync('data/elections', {recursive: true});
for (const [path, value] of [[file, snapshot], [dryFile, dryRun]]) writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
writeFileSync('data/elections/composition-manifest.json', `${JSON.stringify({source, files: [file, dryFile].map(path => ({path, sha256: hash(readFileSync(path))}))}, null, 2)}\n`);
console.log(JSON.stringify(dryRun.totals, null, 2));

for (const page of [tablePage, home, reuse]) page.document.defaultView.close();
