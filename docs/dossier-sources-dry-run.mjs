import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Research only. Offline unless --verify-psaa is explicitly requested.
const root = 'docs/dossier-sources-2026-11';
const read = name => JSON.parse(readFileSync(`${root}/${name}`, 'utf8'));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const write = process.argv.includes('--write');
const sourceFiles = ['audit-mhclg-tables.json', 'audit-psaa-inspection.json', 'audit-psaa-body-names.json',
  'section-114-notices.json'];
// Updated by hand in PR 68 (18 November 2026) to record the pinned section 114
// register. Pinned by hash and verified, never regenerated: --write must not
// replace them with the older generated content. Repin them by hand.
const handFiles = ['section-114-register-search.json', 'dry-run-section-114.json'];
const outputFiles = ['dry-run-audit.json', 'dry-run-audit-names.json'];
const manifest = read('manifest.json');
const paths = sourceFiles.concat(handFiles, outputFiles).map(name => `${root}/${name}`).sort();
assert.deepEqual(manifest.files.map(f => f.path).sort(), paths, 'Unexpected manifest inventory');
function verifyFile(f) {
  assert.equal(sha(f.path), f.sha256, `SHA-256 mismatch: ${f.path}`);
  assert.equal(readFileSync(f.path).length, f.bytes, `Size mismatch: ${f.path}`);
}
// Even explicit regeneration verifies every pinned input first.
for (const f of manifest.files) {
  if (!write || !outputFiles.some(name => f.path === `${root}/${name}`)) verifyFile(f);
}
const save = (name, value) => {
  assert(outputFiles.includes(name));
  if (write) writeFileSync(`${root}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
  else assert.deepEqual(read(name), value, `Dry run does not reproduce: ${name}`);
};
const profiles = JSON.parse(readFileSync('data/council-tax/england-2026-27.json', 'utf8')).authorities;
const profileRows = Object.entries(profiles).map(([gss, r]) => ({gss, council: r.name, class: r.classCode}));
assert.equal(profileRows.length, 296);
const context = {checked: '2026-11-15', base_commit: '96df5d19cb386ab78dda76af8d6937e1070748d6', profile_count: 296,
  profile_file: 'data/council-tax/england-2026-27.json', profile_sha256: sha('data/council-tax/england-2026-27.json'), rendered: false};
assert.equal(manifest.profile_sha256, context.profile_sha256, 'Profile input changed');
const registryFile = 'data/registry/councils.json';
assert.equal(sha(registryFile), manifest.registry_sha256, 'Registry input changed');
const registry = JSON.parse(readFileSync(registryFile, 'utf8')).councils;
const officialProfiles = profileRows.map(r => {
  assert.equal(registry[r.gss]?.gss, r.gss);
  assert.equal(typeof registry[r.gss].officialName, 'string');
  return {gss: r.gss, official_name: registry[r.gss].officialName, class: r.class};
});

const audit = read('audit-mhclg-tables.json');
const psaa = read('audit-psaa-inspection.json');
assert.equal(audit.tables.length, 4);
assert(psaa.sheets.every(s => s.gss_or_ons_columns.length === 0));
save('dry-run-audit.json', {...context,
  join_rule: 'Only an exact GSS or ONS code already present in a publisher row. No inferred codes, name joins or predecessor substitutions.',
  mhclg: {source: 'audit-mhclg-tables.json', publication_date: audit.published_or_updated, cut_off: audit.data_cut_off,
    years: ['Up to and including 2022/23', '2023/24', '2024/25'],
    body_rows_by_table: audit.tables.slice(1).map(t => ({heading: t.heading, rows: t.rows.length-1})),
    exact_join_count: 0, source_has_code_column: false,
    warning: 'The first table has 67 body rows although publisher prose says 68. Preserve the table and flag the discrepancy. Lists cover selected bodies, not all councils.'},
  psaa: {source: 'audit-psaa-inspection.json', publication_date: psaa.publication_date, cut_off: psaa.data_cut_off,
    years: psaa.sheets.map(s => s.sheet), exact_join_count: 0, source_has_code_column: false,
    body_audit_rows_by_year: psaa.sheets.map(s => ({year: s.sheet, rows: s.rows, status_counts: s.status_counts})),
    warning: 'Counts include pension fund audits and other opted-in bodies. Delivery status is not opinion type, assurance, financial condition or accounts publication.'},
  all_profiles_without_exact_row: profileRows,
  absence_interpretation: 'All 296 lack a code-addressable row. This is a missing join key, not evidence that a named body is absent from the publication or has no audit opinion.',
  build_ready: false, decisions: ['Approve an independently evidenced body-to-code crosswalk before import', 'Select a publication/delivery measure and preserve its cut-off', 'Resolve PSAA reuse terms before redistributing transformed per-body data']});

const notices = read('section-114-notices.json');
for (const n of notices.notices) {
  assert(profiles[n.profile_gss]); assert.match(n.notice_date, /^\d{4}-\d{2}-\d{2}$/);
  assert(n.url.startsWith('https://')); assert.match(n.original_sha256, /^[a-f0-9]{64}$/);
}
// Only these three changes are permitted. Preserve punctuation, spacing,
// word order, prefixes, footnotes, body qualifiers and historic labels.
const normalise = name => name.toLowerCase().replaceAll('&', 'and').replace(/ council$/, '');
const psaaNames = read('audit-psaa-body-names.json');
assert.equal(psaaNames.original_sha256, psaa.original_sha256);
assert.equal(psaaNames.url, psaa.url);
assert.deepEqual(psaaNames.sheets.map(s => s.sheet), psaa.sheets.map(s => s.sheet));
for (const [i, sheet] of psaaNames.sheets.entries()) {
  assert.equal(sheet.rows, psaa.sheets[i].rows);
  assert.equal(sheet.bodies.reduce((n, b) => n + b.audit_rows, 0), sheet.rows);
  assert.equal(new Set(sheet.bodies.map(b => b.name)).size, sheet.bodies.length);
  assert(sheet.bodies.every(b => Number.isInteger(b.audit_rows) && b.audit_rows > 0));
}

function compareNames(inputRows) {
  const bodies = new Map();
  for (const row of inputRows) {
    assert.equal(typeof row.name, 'string');
    if (!bodies.has(row.name)) bodies.set(row.name, {source_name: row.name, occurrences: []});
    bodies.get(row.name).occurrences.push({cohort: row.cohort, source_rows: row.source_rows});
  }
  const matched = [], unmatched = [], ambiguous = [];
  for (const body of [...bodies.values()].sort((a, b) => a.source_name.localeCompare(b.source_name, 'en'))) {
    const candidates = officialProfiles.filter(p => normalise(p.official_name) === normalise(body.source_name));
    const row = {...body, normalised_name: normalise(body.source_name), candidates};
    if (candidates.length === 1) matched.push(row);
    else if (candidates.length === 0) unmatched.push(row);
    else ambiguous.push(row);
  }
  const matchedCodes = new Set(matched.map(r => r.candidates[0].gss));
  const ambiguousCodes = new Set(ambiguous.flatMap(r => r.candidates.map(p => p.gss)));
  assert([...matchedCodes].every(code => !ambiguousCodes.has(code)));
  const unmatchedProfiles = officialProfiles.filter(p => !matchedCodes.has(p.gss) && !ambiguousCodes.has(p.gss));
  const ambiguousProfiles = officialProfiles.filter(p => ambiguousCodes.has(p.gss));
  return {
    exact_code_matches: 0,
    source_rows: inputRows.reduce((n, r) => n + r.source_rows, 0),
    unique_source_bodies: bodies.size,
    source_bodies: {matched: matched.length, unmatched: unmatched.length, ambiguous: ambiguous.length},
    profiles: {matched: matchedCodes.size, unmatched: unmatchedProfiles.length, ambiguous: ambiguousProfiles.length, total: 296},
    literal_name_matched_profiles: new Set(matched.filter(r => r.source_name === r.candidates[0].official_name).map(r => r.candidates[0].gss)).size,
    matched_bodies: matched, unmatched_bodies: unmatched, ambiguous_bodies: ambiguous,
    unmatched_profiles: unmatchedProfiles, ambiguous_profiles: ambiguousProfiles,
  };
}

const mhclgCohorts = audit.tables.slice(1).map(t => {
  assert.equal(t.rows[0][0], 'Name of body');
  return {cohort: t.heading, rows: t.rows.slice(1).map(r => ({name: r[0], cohort: t.heading, source_rows: 1}))};
});
const psaaCohorts = psaaNames.sheets.map(s => ({cohort: s.sheet,
  rows: s.bodies.map(b => ({name: b.name, cohort: s.sheet, source_rows: b.audit_rows}))}));
const comparePublication = cohorts => ({
  combined: compareNames(cohorts.flatMap(c => c.rows)),
  by_cohort: cohorts.map(c => {
    const result = compareNames(c.rows);
    return {cohort: c.cohort, exact_code_matches: result.exact_code_matches,
      source_rows: result.source_rows, unique_source_bodies: result.unique_source_bodies,
      source_bodies: result.source_bodies, profiles: result.profiles,
      literal_name_matched_profiles: result.literal_name_matched_profiles};
  }),
});
const nameRun = {...context, registry_file: registryFile, registry_sha256: sha(registryFile),
  registry_name_field: 'officialName',
  registry_name_provenance: 'Pinned GOV.UK Local Links Manager names in the registry refreshed by PR 58. No short names used.',
  normalisation: ['Convert case to lower case', 'Replace each ampersand with and', 'Remove one trailing Council, including its preceding space'],
  exclusions: 'No whitespace folding or trimming, punctuation removal, footnote stripping, abbreviation expansion, word reordering, alternate names, predecessor substitution or fuzzy matching.',
  counting_rule: '296 current billing profiles identified by code, then compared using registry officialName only. Distinct source labels counted once per publication or cohort; occurrences retain source-row counts. Across-year repetition is not ambiguity. A label matching multiple profile codes is ambiguous and never assigned. No audit status selected or transferred.',
  mhclg: {source: 'audit-mhclg-tables.json', ...comparePublication(mhclgCohorts)},
  psaa: {source: 'audit-psaa-body-names.json', ...comparePublication(psaaCohorts)},
  build_ready: false, crosswalk_adopted: false,
  decision: 'Source measure, identity crosswalk and PSAA reuse remain decisions for the owner. Name agreement is a research diagnostic, not authority to import audit data.',
};
save('dry-run-audit-names.json', nameRun);

// Optional independent reconstruction of the factual name inventory. Never save
// the full workbook or its metadata, personal fields or per-body audit statuses.
if (process.argv.includes('--verify-psaa')) {
  const {default: readXlsxFile} = await import('read-excel-file/node');
  const response = await fetch(psaa.url);
  assert(response.ok, `PSAA HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(createHash('sha256').update(bytes).digest('hex'), psaa.original_sha256, 'PSAA original changed');
  const workbook = await readXlsxFile(bytes);
  for (const [i, sheet] of psaa.sheets.entries()) {
    const original = workbook.find(s => s.sheet === sheet.sheet);
    assert(original, `Missing sheet: ${sheet.sheet}`);
    assert.deepEqual(original.data[0], sheet.columns);
    const rows = original.data.slice(1).filter(r => r[1]);
    assert.equal(rows.length, sheet.rows);
    const names = rows.map(r => r[1]);
    const bodies = [...new Set(names)].sort().map(name => ({name, audit_rows: names.filter(n => n === name).length}));
    assert.deepEqual(bodies, psaaNames.sheets[i].bodies, `Name extraction changed: ${sheet.sheet}`);
  }
}

if (write) {
  manifest.base_commit = context.base_commit;
  manifest.files = manifest.files.map(f => !outputFiles.some(name => f.path === `${root}/${name}`) ? f :
    {...f, bytes: readFileSync(f.path).length, sha256: sha(f.path)});
  writeFileSync(`${root}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
}
for (const f of manifest.files) verifyFile(f);
const forbidden = new RegExp(`[${String.fromCharCode(8211, 8212)}]| \\x2d |&(?:mdash|ndash);|&#(?:8211|8212);|&#x201[34];|\\\\u201[34]`, 'i');
for (const path of paths.concat(`${root}/manifest.json`)) {
  assert(!forbidden.test(readFileSync(path, 'utf8')), `Forbidden punctuation: ${path}`);
}
console.log(JSON.stringify({profiles: 296, hashes_verified: manifest.files.length,
  audit_exact_code: 0, audit_names: {mhclg: nameRun.mhclg.combined.profiles, psaa: nameRun.psaa.combined.profiles},
  notices_inspected: notices.notices.length, crosswalk_adopted: false}));
