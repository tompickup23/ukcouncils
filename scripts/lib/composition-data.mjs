import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

export const COLUMN_LABELS = {Lab: 'Labour', Con: 'Conservative', LD: 'Liberal Democrat', Grn: 'Green', Ref: 'Reform UK', Oth: 'Other', Vac: 'Vacant', Total: 'Total'};
export const CONTROL_PARTIES = {LAB: 'Lab', CON: 'Con', LD: 'LD', GRN: 'Grn', REF: 'Ref'};
export const CONTROL_CAVEAT = "This is the compiler's record of control at the snapshot date, not an official council return and not a statement of which parties form the administration.";
export const SNAPSHOT_DATE = '2026-11-16';
export const COMPOSITION_PATHS = ['data/elections/composition-manifest.json', `data/elections/composition-${SNAPSHOT_DATE}.json`, `data/elections/composition-review-${SNAPSHOT_DATE}.json`];
const keys = (value, expected) => assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), 'Unexpected composition fields');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const caches = new Map();

export function controlCheck(row) {
  if (!row) return 'no row';
  const key = CONTROL_PARTIES[row.control];
  if (key) return row.columns[key] > row.columns.Total / 2 ? 'passes' : 'fails majority check';
  if (/^(NOC|No overall control)$/i.test(row.control)) return Object.entries(row.columns)
    .filter(([key]) => !['Total', 'Vac'].includes(key)).every(([, value]) => value <= row.columns.Total / 2) ? 'passes' : 'fails no overall control check';
  return row.control === '' ? 'empty publisher field' : 'unsupported publisher value';
}
export function reconciles(row) {
  return Boolean(row && Object.keys(COLUMN_LABELS).every(key => Number.isSafeInteger(row.columns[key]) && row.columns[key] >= 0)
    && row.columns.Total > 0 && Object.entries(row.columns).filter(([key]) => key !== 'Total').reduce((sum, [, value]) => sum + value, 0) === row.columns.Total);
}
export function controlLabel(row) {
  if (controlCheck(row) !== 'passes') return null;
  return CONTROL_PARTIES[row.control] ? COLUMN_LABELS[CONTROL_PARTIES[row.control]] : 'No overall control';
}
export function validateComposition(snapshot, review) {
  keys(snapshot, ['source', 'rows']);
  keys(review, ['source', 'councilStatements', 'totals', 'byClass', 'profiles', 'unmatched', 'outOfScope', 'unmatchedSlugs']);
  assert.deepEqual(snapshot.source, review.source);
  keys(snapshot.source, ['publisher', 'title', 'url', 'retrieved', 'siteLastUpdatedLabel', 'originalSha256', 'licence', 'licenceUrl', 'reuseUrl', 'reuseSha256', 'homepageSha256', 'controlHeading', 'controlValues', 'transformation']);
  assert.equal(snapshot.source.retrieved, SNAPSHOT_DATE);
  assert.equal(snapshot.source.controlHeading, 'Control');
  assert.equal(snapshot.source.licence, 'CC BY-SA 4.0');
  assert.equal(snapshot.rows.length, 318);
  const byCode = new Map();
  const ids = new Set();
  for (const row of snapshot.rows) {
    keys(row, ['id', 'identityUrl', 'columns', 'control', 'gss', 'identitySha256']);
    keys(row.columns, Object.keys(COLUMN_LABELS));
    assert.match(row.id, /^\d+$/);
    assert.match(row.gss, /^E(?:06|07|08|09|10)\d{6}$/);
    assert.equal(row.identityUrl, `https://opencouncildata.co.uk/council.php?c=${row.id}&y=0`);
    assert.match(row.identitySha256, /^[a-f0-9]{64}$/);
    assert.equal(typeof row.control, 'string');
    assert(row.control === '' || row.control === 'No overall control' || /^(?:[A-Z]+|Aspire)(?:\/[A-Z]+)*(?: min| Mayor)?$/.test(row.control), 'Unknown control syntax');
    assert(!ids.has(row.id) && !byCode.has(row.gss), 'Duplicate composition identity');
    ids.add(row.id); byCode.set(row.gss, row);
  }
  assert.deepEqual(snapshot.source.controlValues, [...new Set(snapshot.rows.map(row => row.control))].sort());
  assert.equal(review.profiles.length, 296);
  keys(review.councilStatements, ['repository', 'path', 'commit', 'checked_at']);
  assert.match(review.councilStatements.commit, /^[a-f0-9]{40}$/);
  const profiles = new Map();
  for (const profile of review.profiles) {
    keys(profile, ['gss', 'slug', 'classCode', 'sourceId', 'columns', 'reconciliation', 'control', 'controlCheck1', 'controlCheck2', 'seatsAdmitted', 'controlAdmitted']);
    keys(profile.controlCheck2, ['slug', 'outcome', 'commit']);
    assert.equal(profile.controlCheck2.slug, profile.slug);
    assert.equal(profile.controlCheck2.commit, review.councilStatements.commit);
    assert(['agrees', 'disagrees', 'no council statement held'].includes(profile.controlCheck2.outcome));
    const row = byCode.get(profile.gss);
    assert.equal(profile.sourceId, row?.id ?? null);
    assert.deepEqual(profile.columns, row?.columns ?? null);
    assert.equal(profile.control, row?.control ?? null);
    assert.equal(profile.reconciliation, !row ? 'no row' : reconciles(row) ? 'reconciles' : 'fails');
    assert.equal(profile.controlCheck1, controlCheck(row));
    const seats = reconciles(row) && profile.slug !== 'city-of-london';
    assert.equal(profile.seatsAdmitted, seats);
    assert.equal(profile.controlAdmitted, seats && controlCheck(row) === 'passes' && profile.controlCheck2.outcome !== 'disagrees');
    assert(!profiles.has(profile.gss), 'Duplicate profile');
    profiles.set(profile.gss, profile);
  }
  assert.deepEqual(review.outOfScope, snapshot.rows.filter(row => !profiles.has(row.gss)));
  assert.equal(review.outOfScope.length, 23);
  return profiles;
}
export function loadComposition(root = process.cwd()) {
  if (caches.has(root)) return caches.get(root);
  const manifest = JSON.parse(readFileSync(resolve(root, COMPOSITION_PATHS[0]), 'utf8'));
  keys(manifest, ['source', 'files']);
  assert.deepEqual(manifest.files.map(file => file.path), COMPOSITION_PATHS.slice(1));
  const [snapshot, review] = manifest.files.map(file => {
    keys(file, ['path', 'sha256']);
    const bytes = readFileSync(resolve(root, file.path));
    assert.equal(digest(bytes), file.sha256, `Unpinned composition file ${file.path}`);
    return JSON.parse(bytes);
  });
  assert.deepEqual(manifest.source, snapshot.source);
  const profiles = validateComposition(snapshot, review);
  const result = {source: snapshot.source, profiles, review};
  caches.set(root, result);
  return result;
}
export function compositionFor(gss, root = process.cwd()) {
  const profile = loadComposition(root).profiles.get(gss);
  if (!profile?.seatsAdmitted) return null;
  return {sourceId: profile.sourceId, columns: profile.columns, control: profile.controlAdmitted ? controlLabel(profile) : null};
}
export function compositionAbsence(profile, kind) {
  if (profile.slug === 'city-of-london') return 'City of London is held pending review of its chamber definition.';
  if (!profile.sourceId) return 'The pinned Open Council Data table has no row for Isles of Scilly.';
  if (profile.reconciliation !== 'reconciles') return 'The printed party totals do not reconcile to the printed total; held for review.';
  if (kind !== 'control') return null;
  // Say why this profile is held. "Sources disagree" is true only where a label this site
  // prints passed the seat check and an eligible council statement names something else.
  if (profile.controlCheck1 === 'empty publisher field') return 'The compiler records no control label for this council.';
  if (profile.controlCheck1 === 'unsupported publisher value') return "The compiler's control label for this council is not one of the single party labels this site prints. No control is inferred from the seat totals.";
  if (profile.controlCheck1 !== 'passes') return "The compiler's control label does not pass this site's seat check; held for review.";
  return 'sources disagree; held for review';
}
