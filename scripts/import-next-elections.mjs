import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { fetchPinnedJson } from './lib/pinned-json.mjs';
export const ELECTION_COMMIT = '3cf7cf60b0bf7772f17dd743643ca680dd777199';
export const ELECTION_HASH = 'e24e7ed63284de8577e2f11d0991af8b1402e6d93ca1b5a20a0756d703d4e27f';
export const PREDECESSOR_COMMIT = 'b1a32625943981c9f5a1c97e1c8f89d2dadc1985';
export const PREDECESSOR_HASH = '4826532fd29bd7fe9cb6b71a218f6c79f6e7936e875ccb4427057b6f51991a87';
export async function importNextElections() {
  const register = await fetchPinnedJson(`https://raw.githubusercontent.com/tompickup23/ukelections/${ELECTION_COMMIT}/data/identity/council-next-elections.json`, ELECTION_HASH, 'UK Elections');
  const predecessors = await fetchPinnedJson(`https://raw.githubusercontent.com/tompickup23/ukplaces/${PREDECESSOR_COMMIT}/src/data/registry/gss-predecessors.json`, PREDECESSOR_HASH, 'UK Places predecessors');
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'data/registry/councils.json'), 'utf8')).councils;
  const current = JSON.parse(readFileSync(resolve(process.cwd(), 'data/council-tax/england-2026-27.json'), 'utf8')).authorities;
  const byCode = new Map();
  for (const record of Object.values(register.councils)) {
    if (!record.lad24cd) continue;
    assert(!byCode.has(record.lad24cd), `duplicate GSS ${record.lad24cd}`);
    byCode.set(record.lad24cd, record);
  }
  const councils = {};
  const statuses = {};
  for (const {gss} of Object.values(registry).filter(c => current[c.gss])) {
    let row = byCode.get(gss);
    let joinedVia = null;
    if (!row && ['E08000038', 'E08000039'].includes(gss)) {
      joinedVia = predecessors.predecessors[gss]?.[0]?.gss;
      assert.equal(joinedVia, gss === 'E08000038' ? 'E08000016' : 'E08000019');
      row = byCode.get(joinedVia);
    }
    assert(row, `missing election record ${gss}`);
    statuses[row.status] = (statuses[row.status] ?? 0) + 1;
    if (row.status !== 'verified' || !Number.isInteger(row.next_year) || !row.quote?.includes(String(row.next_year))) continue;
    assert(['whole', 'thirds', 'halves'].includes(row.pattern));
    assert(row.source_label && /^https?:\/\//.test(row.source_url));
    councils[gss] = {nextYear: row.next_year, dateLabel: row.date_label ?? null, pattern: row.pattern, sourceLabel: row.source_label, sourceUrl: row.source_url, quote: row.quote, joinedVia};
  }
  assert.deepEqual(statuses, {verified: 220, unverified: 65, abolished: 11});
  assert.equal(Object.keys(councils).length, 174);
  const counts = key => Object.values(councils).reduce((out, row) => {out[row[key]] = (out[row[key]] ?? 0) + 1; return out;}, {});
  assert.deepEqual(counts('nextYear'), {2027: 152, 2028: 8, 2029: 12, 2030: 2});
  assert.deepEqual(counts('pattern'), {whole: 113, thirds: 57, halves: 4});
  const source = {
    publisher: 'UK Elections', title: 'council election register', file: 'data/identity/council-next-elections.json',
    commit: ELECTION_COMMIT, sha256: ELECTION_HASH, checked: register.checked_at, method: register.method,
    rule: 'Printed only where the record is verified and the quoted text contains the year.',
    predecessors: {publisher: 'Office for National Statistics', title: 'Code History Database (June 2026), Changes table', via: 'UK Places src/data/registry/gss-predecessors.json', commit: PREDECESSOR_COMMIT, sha256: PREDECESSOR_HASH},
  };
  mkdirSync(resolve(process.cwd(), 'data/elections'), {recursive: true});
  writeFileSync(resolve(process.cwd(), 'data/elections/next-elections.json'), JSON.stringify({schemaVersion: 1, source, councils}, null, 2) + '\n');
  console.log('174 printable election records; pinned hashes, statuses, years and patterns passed.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importNextElections();
