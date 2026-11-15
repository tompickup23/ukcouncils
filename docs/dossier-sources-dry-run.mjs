import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Research only. No network, application import, render or source refresh.
const root = 'data/sources/dossier-2026-11';
const read = name => JSON.parse(readFileSync(`${root}/${name}`, 'utf8'));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const save = (name, value) => writeFileSync(`${root}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
const profiles = JSON.parse(readFileSync('data/council-tax/england-2026-27.json', 'utf8')).authorities;
const profileRows = Object.entries(profiles).map(([gss, r]) => ({gss, council: r.name, class: r.classCode}));
assert.equal(profileRows.length, 296);
const context = {checked: '2026-11-15', base_commit: 'f4311a8fbb9408c1bb727a2f25d02e1bb6ded925', profile_count: 296,
  profile_file: 'data/council-tax/england-2026-27.json', profile_sha256: sha('data/council-tax/england-2026-27.json'), rendered: false};
const count = rows => rows.reduce((o, k) => ({...o, [k]: (o[k] || 0) + 1}), {});
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

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
const noticeCodes = new Set(notices.notices.map(n => n.profile_gss));
save('dry-run-section-114.json', {...context,
  source: 'section-114-notices.json', inspected_notice_documents: notices.notices.length,
  native_code_joins: 0, manually_identified_profile_records: noticeCodes.size,
  identity_rule: 'Body identities were reviewed against official council domains, then assigned the existing profile code. This is explicit editorial identity evidence, not a native GSS join.',
  verified_documents: notices.notices.map(n => ({gss: n.profile_gss, council: n.council, date: n.notice_date, section: n.section, url: n.url})),
  official_confirmation_leads: notices.official_confirmations_pending_notice.length,
  profiles_without_an_inspected_notice_in_this_research: profileRows.filter(r => !noticeCodes.has(r.gss)),
  absence_interpretation: 'No claim that remaining councils have never issued a notice. No inference from Exceptional Financial Support. No claim that a historic notice remains in force.',
  build_ready: false, decision: 'Approve a non-exhaustive dated notice register and explicit body identity mapping; require original notice inspection for every added record.'});

const a = read('composition-option-a.json');
const seen = new Set();
const rows = a.rows.map(r => {
  assert.equal(r.gss_codes_as_printed.length, 1); const gss = r.gss_codes_as_printed[0];
  assert(!seen.has(gss), `Duplicate code ${gss}`); seen.add(gss);
  assert.equal(sum(r.party_totals), r.total, r.council);
  assert(Object.values(r.party_totals).every(x => Number.isInteger(x) && x >= 0));
  return {...r, gss};
});
const matched = rows.filter(r => profiles[r.gss]);
assert.equal(matched.length, 295);
const baseline = read('composition-2026-election-baseline.json');
const baselineById = new Map();
for (const r of baseline.rows) {assert(!baselineById.has(Number(r['council id']))); baselineById.set(Number(r['council id']), r);}
const baselineChecks = matched.map(r => {
  const old = baselineById.get(r.compiler_id);
  if (!old) return {gss: r.gss, council: r.council, baseline_present: false};
  const fields = ['con', 'lab', 'ld', 'green', 'ukip', 'ref', 'pc', 'snp', 'other'];
  for (const k of fields) assert.match(old[k], /^\d+$/);
  const total = fields.reduce((n, k) => n + Number(old[k]), 0);
  const buckets = {Lab: +old.lab, Con: +old.con, LD: +old.ld, Grn: +old.green, Ref: +old.ref,
    Oth: +old.ukip + +old.pc + +old.snp + +old.other};
  const differences = Object.entries(buckets).filter(([k, v]) => r.party_totals[k] !== v)
    .map(([party, previous]) => ({party, previous, current: r.party_totals[party]}));
  return {gss: r.gss, council: r.council, baseline_present: true, baseline_total: +old.total,
    baseline_party_sum: total, baseline_reconciles: total === +old.total,
    current_total: r.total, current_vacancies: r.party_totals.Vac, differences};
});
const events = read('composition-party-changes.json');
const byId = new Map(matched.map(r => [r.compiler_id, r]));
const joinedEvents = events.rows.filter(e => byId.has(e.compiler_id)).map(e => ({...e, gss: byId.get(e.compiler_id).gss}));
const b = read('composition-option-b-sample.json');
assert.equal(b.rows.length, 20);
assert.deepEqual(count(b.rows.map(r => r.profile_class)), {SD:4, UA:4, MD:4, ILB:4, OLB:4});
assert.equal(new Set(b.rows.map(r => r.profile_gss)).size, 20);
for (const r of b.rows) {assert.equal(sum(r.party_totals), r.party_sum); assert.equal(r.party_sum, r.reconciliation_total);}
const comparisons = b.rows.map(r => {
  const compiled = matched.find(c => c.gss === r.profile_gss); assert(compiled);
  return {gss:r.profile_gss, council:r.council, official_date:r.date_shown,
    official_party_or_group_totals:r.party_totals, official_seat_total:r.reconciliation_total,
    compiler_buckets:compiled.party_totals, compiler_seat_total:compiled.total,
    seat_totals_agree:r.reconciliation_total===compiled.total,
    caution:'Side-by-side values only. Group labels and compiler Other are not interchangeable individual parties. No automatic resolution of disagreement.'};
});
save('dry-run-seats.json', {...context,
  option_a: {source:'composition-option-a.json', rows:rows.length, rows_reconciled:rows.length,
    exact_code_matches:matched.length, matched_by_class:count(matched.map(r=>profiles[r.gss].classCode)),
    unmatched_profiles:profileRows.filter(r=>!seen.has(r.gss)),
    source_rows_outside_profile_scope:rows.filter(r=>!profiles[r.gss]).map(r=>({gss:r.gss,council:r.council})),
    joined_profile_rows:matched.map(r=>({gss:r.gss,council:r.council,total:r.total,party_totals:r.party_totals})),
    includes_2026_election_archive:true, effective_date_caveat:'Snapshot retrieved 15 November 2026; site last-updated date is not a per-council effective date.',
    baseline_comparison_scope:'2026 archive described by publisher as shortly after May elections. Not a verified last ordinary election date for every council. UKIP, PC and SNP grouped into Other for this diagnostic only; vacancies not backfilled into archive.',
    baseline_present:baselineChecks.filter(r=>r.baseline_present).length,
    baseline_reconciled:baselineChecks.filter(r=>r.baseline_reconciles).length,
    changed_since_2026_archive:baselineChecks.filter(r=>r.differences?.length).length,
    baseline_checks:baselineChecks,
    party_change_events_after_7_may:joinedEvents.length,
    profiles_with_party_change_events:[...new Set(joinedEvents.map(e=>e.gss))].sort().map(gss=>({gss,council:profiles[gss].name})),
    party_change_events:joinedEvents,
    by_election_archive:{source:'composition-by-elections.json',rows:read('composition-by-elections.json').rows.length,
      exact_code_joins:0,reason:'No code or publisher council ID on archive rows; names are retained as source labels only. Holds do not change a party total. Dates are not verified polling dates.'}},
  option_b: {source:'composition-option-b-sample.json',sample_size:20,by_class:count(b.rows.map(r=>r.profile_class)),
    reconciled:20,totals_on_same_source_page:b.rows.filter(r=>r.total_seats_as_printed!==null).length,
    additional_official_seat_total_sources:b.rows.filter(r=>r.seat_total_support).length,
    shown_dates:b.rows.filter(r=>r.date_shown).length,missing_dates:b.rows.filter(r=>!r.date_shown).map(r=>r.council),
    original_bytes_hashed:b.rows.filter(r=>r.original_sha256).length,
    indexed_or_reader_transcriptions:b.rows.filter(r=>!r.original_sha256).map(r=>r.council),
    native_code_joins:0,reviewed_profile_assignments:20,side_by_side_comparison:comparisons,
    official_change_evidence:'composition-official-change-evidence.json',
    caveat:'Purposive sample, not a coverage estimate. A reconciled total does not prove currency, party membership or election completeness.'},
  build_ready:false, decision:'Choose compilation or official-page route, acceptable dating and party/group granularity, refresh ownership, and an absence rule. Keep control and estimates absent.'});

const sources = readdirSync(root).filter(f=>f.endsWith('.json') && f!=='manifest.json' && !f.startsWith('dry-run-')).sort();
const originals = [];
function collect(value, path, sourceFile) {
  if (!value || typeof value!=='object') return;
  if (value.original_sha256) originals.push({file:sourceFile,locator:path,url:value.url || value.table_url || null,sha256:value.original_sha256});
  if (value.source_sha256) originals.push({file:sourceFile,locator:path,url:value.source_url,sha256:value.source_sha256});
  for (const [key, child] of Object.entries(value)) if (typeof child==='object') collect(child,`${path}.${key}`,sourceFile);
}
for (const file of sources) collect(read(file),'$',file);
const manifestFiles = [...sources,'dry-run-audit.json','dry-run-section-114.json','dry-run-seats.json'];
save('manifest.json',{...context, hash_algorithm:'SHA-256',
  retention_rule:'Selected extracts without personal names, not byte-identical originals. Original response hashes are separately labelled. No claim of an original hash when direct retrieval was blocked. PSAA workbook not redistributed.',
  files:manifestFiles.map(file=>({path:`${root}/${file}`,bytes:readFileSync(`${root}/${file}`).length,sha256:sha(`${root}/${file}`)})),original_responses:originals});
for (const f of manifestFiles.concat('manifest.json')) {
  const text=readFileSync(`${root}/${f}`,'utf8');
  const forbidden = new RegExp(`[${String.fromCharCode(8211, 8212)}]| \x2d |&(?:mdash|ndash);|&#(?:8211|8212);|\\\\u201[34]`, 'i');
  assert(!forbidden.test(text), `Forbidden punctuation: ${f}`);
}
console.log(JSON.stringify({profiles:296,audit_exact:0,notices_inspected:notices.notices.length,composition_exact:matched.length,sample_reconciled:20,changed_since_annual_archive:baselineChecks.filter(r=>r.differences?.length).length}));
