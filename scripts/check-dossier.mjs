import {compositionChecks} from './lib/composition-checks.mjs';
import {section114Checks} from './lib/section-114-checks.mjs';
import {auditChecks} from './lib/audit-checks.mjs';
import {readFileSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadDossier, ITEMS, STATES} from './lib/dossier-state.mjs';
import {dossierCoverage} from './lib/dossier-coverage.mjs';

const report = loadDossier();
const failures = [];
const actual = readdirSync('dist/councils', {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
const expected = report.profiles.map(profile => profile.slug).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected) || expected.length !== 296) failures.push('Dossier profile inventory must match all 296 English billing authorities');
const counts = Object.fromEntries(ITEMS.map(item => [item, Object.fromEntries(STATES.map(state => [state, 0]))]));
const parts = {};
for (const profile of report.profiles) {
  const html = readFileSync(join('dist/councils', profile.slug, 'index.html'), 'utf8');
  failures.push(...compositionChecks(html, profile.gss).map(failure => `${profile.slug}: ${failure}`));
  failures.push(...section114Checks(html, profile.gss).map(failure => `${profile.slug}: ${failure}`));
  failures.push(...auditChecks(html, profile.gss).map(failure => `${profile.slug}: ${failure}`));
  failures.push(...dossierCoverage(html, profile).map(failure => `${profile.slug}: ${failure}`));
  for (const item of ITEMS) counts[item][profile.items[item].state]++;
  for (const part of profile.parts) {
    parts[part.key] ??= Object.fromEntries(STATES.map(state => [state, 0]));
    parts[part.key][part.state]++;
  }
}
mkdirSync('.ops', {recursive: true});
writeFileSync('.ops/dossier-coverage.json', `${JSON.stringify({...report, counts, parts, failures}, null, 2)}\n`);
console.log(JSON.stringify({profiles: expected.length, counts, parts, failures: failures.length}, null, 2));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
