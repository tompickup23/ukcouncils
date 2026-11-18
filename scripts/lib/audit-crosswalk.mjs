import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const AUDIT_DATE = '2026-11-18';
export const AUDIT_PATHS = ['data/audit/manifest.json', `data/audit/review-${AUDIT_DATE}.json`,
  `data/audit/crosswalk-${AUDIT_DATE}.json`, `data/audit/dry-run-${AUDIT_DATE}.json`,
  `data/audit/values-${AUDIT_DATE}.json`, `data/audit/values-dry-run-${AUDIT_DATE}.json`];
export const INPUT_PATHS = ['docs/dossier-sources-2026-11/audit-mhclg-tables.json',
  'data/council-tax/england-2026-27.json', 'data/registry/councils.json'];
// The four answer columns, in printed order. The appointed audit firm column is
// dropped as soon as the research table is read and never enters a value file.
export const ANSWER_KEYS = ['draftAccounts', 'opinionDelivered', 'dateDelivered', 'opinionPublished'];
const FIRM_COLUMN = 'Appointed audit firm';
// The footnote printed below the 27 February 2026 table, retrieved from GOV.UK on
// 18 November 2026. Its asterisk follows four body labels in that table.
export const ASTERISK_FOOTNOTE = {
  marker: '*',
  printed: '*These bodies and their appointed audit firms are included on the list because audit opinions from prior years, relating to audits carried out by previous auditors, remained outstanding at the time of the backstop.',
  backstop: '2026-02-27',
  location: 'Paragraph printed immediately after the 27 February 2026 table',
  retrieved: AUDIT_DATE,
};
export const BODY_CLASSES = ['county', 'police', 'fire', 'pension-fund', 'combined-authority', 'other'];
const keys = (value, expected) => {
  assert(value && typeof value === 'object' && !Array.isArray(value), 'Expected audit object');
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), 'Unexpected audit fields');
};
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const nonempty = value => assert(typeof value === 'string' && value.trim().length > 0, 'Missing audit evidence');
const sorted = values => [...values].sort();
export const normaliseAuditName = name => name.toLowerCase().replaceAll('&', 'and').replace(/ council$/, '');

function validateEvidence(evidence) {
  assert(Array.isArray(evidence) && evidence.length > 0, 'Missing audit evidence');
  for (const item of evidence) {
    keys(item, ['url', 'retrieved', 'quote', 'note']);
    for (const value of Object.values(item)) nonempty(value);
    const url = new URL(item.url);
    assert.equal(url.protocol, 'https:');
    assert(url.hostname.endsWith('.gov.uk') || url.hostname === 'salisburycitycouncil.gov.uk'
      || url.hostname === 'cumberland.moderngov.co.uk', 'Evidence must use an official source');
    assert.equal(item.retrieved, AUDIT_DATE);
  }
}

export function validateAuditReview(review) {
  keys(review, ['reviewed', 'rows']);
  assert.equal(review.reviewed, AUDIT_DATE);
  assert.equal(review.rows.length, 51);
  const labels = new Set(), codes = new Set();
  for (const row of review.rows) {
    keys(row, ['label', 'tier', 'decision', 'gss', 'bodyClass', 'evidence']);
    nonempty(row.label);
    assert(!labels.has(row.label), 'Duplicate audit label'); labels.add(row.label);
    assert.equal(row.tier, 2);
    validateEvidence(row.evidence);
    assert(['assigned', 'not-billing-profile', 'unresolved'].includes(row.decision));
    if (row.decision === 'assigned') {
      assert.match(row.gss, /^E(?:06|07|08|09)\d{6}$/);
      assert(!codes.has(row.gss), 'Duplicate profile code in audit review'); codes.add(row.gss);
      assert.equal(row.bodyClass, null);
    } else {
      assert.equal(row.gss, null);
      if (row.decision === 'not-billing-profile') assert(BODY_CLASSES.includes(row.bodyClass));
      else assert.equal(row.bodyClass, null);
    }
  }
}

function validateSource(source) {
  keys(source, ['publisher', 'title', 'url', 'original_sha256', 'published_or_updated', 'data_cut_off',
    'retrieved', 'licence', 'licence_url', 'edition_checked', 'edition_url', 'scope', 'discrepancy', 'transformation', 'tables']);
  assert.equal(source.published_or_updated, '2026-03-26');
  assert.equal(source.data_cut_off, '2026-03-09');
  assert.equal(source.edition_checked, AUDIT_DATE);
  assert.equal(source.licence, 'Open Government Licence v3.0');
  assert.deepEqual(source.tables, [
    {backstop: '2024-12-13', financialYears: 'Up to and including 2022/23', bodyRows: 67},
    {backstop: '2025-02-28', financialYears: '2023/24', bodyRows: 50},
    {backstop: '2026-02-27', financialYears: '2024/25', bodyRows: 33},
  ]);
  for (const [key, value] of Object.entries(source)) if (key !== 'tables') nonempty(value);
}

function readInputs(root, manifest) {
  keys(manifest, ['source', 'inputs', 'files']);
  validateSource(manifest.source);
  assert.deepEqual(manifest.inputs.map(file => file.path), INPUT_PATHS, 'Unexpected audit input inventory');
  const [audit, billing, registry] = manifest.inputs.map(file => readPinned(root, file));
  for (const key of ['publisher', 'title', 'url', 'original_sha256', 'published_or_updated', 'data_cut_off', 'retrieved', 'licence', 'licence_url']) {
    assert.equal(manifest.source[key], audit[key], `Audit source changed: ${key}`);
  }
  // Project only the identity properties. Never inspect other registry fields.
  const profiles = Object.keys(billing.authorities).sort().map(gss => {
    const council = registry.councils[gss];
    assert.equal(council?.gss, gss);
    nonempty(council.officialName);
    return {gss, officialName: council.officialName};
  });
  assert.equal(profiles.length, 296);
  const tables = audit.tables.slice(1).map((table, index) => {
    assert.equal(table.rows[0][0], 'Name of body');
    assert(table.rows.every(row => Array.isArray(row) && row.length === 6), 'Unexpected audit table shape');
    assert.equal(table.rows[0][2], FIRM_COLUMN, 'Audit firm column moved; stop and report');
    // Drop the firm column here so no later step can read it.
    const [header, ...body] = table.rows.map(row => row.filter((_, column) => column !== 2));
    const labels = body.map(row => row[0]);
    assert.equal(labels.length, manifest.source.tables[index].bodyRows);
    assert.equal(new Set(labels).size, labels.length, 'Duplicate source label within table');
    return {...manifest.source.tables[index], labels, questions: header.slice(1), answers: body.map(row => row.slice(1))};
  });
  assert.equal(tables.length, 3);
  return {profiles, tables};
}

function readPinned(root, file) {
  keys(file, ['path', 'sha256']);
  assert.match(file.sha256, /^[a-f0-9]{64}$/);
  const bytes = readFileSync(resolve(root, file.path));
  assert.equal(digest(bytes), file.sha256, `Unpinned audit file ${file.path}`);
  return JSON.parse(bytes);
}

export function buildAuditCrosswalk(source, review, inputs) {
  validateAuditReview(review);
  const labels = sorted(new Set(inputs.tables.flatMap(table => table.labels)));
  assert.equal(labels.length, 120);
  const tier1 = new Map(), residual = [];
  for (const label of labels) {
    const matches = inputs.profiles.filter(profile => normaliseAuditName(profile.officialName) === normaliseAuditName(label));
    assert(matches.length < 2, 'Ambiguous tier 1 identity; stop and report');
    if (matches.length === 1) tier1.set(label, matches[0]);
    else residual.push(label);
  }
  assert.equal(new Set([...tier1.values()].map(profile => profile.gss)).size, 69, 'Tier 1 count changed; stop and report');
  assert.equal(tier1.size, 69);
  assert.deepEqual(sorted(review.rows.map(row => row.label)), residual, 'Tier 2 must review every residual label exactly once');
  const reviewed = new Map(review.rows.map(row => [row.label, row]));
  const profiles = new Map(), unassigned = [];
  for (const label of labels) {
    const exact = tier1.get(label), decision = reviewed.get(label);
    const occurrences = inputs.tables.flatMap(table => table.labels.includes(label)
      ? [{backstop: table.backstop, row: table.labels.indexOf(label) + 1}] : []);
    const row = exact ? {label, tier: 1, evidence: [{registryPath: INPUT_PATHS[2], officialName: exact.officialName,
      method: 'Lower case, ampersand to and, remove one trailing Council with its preceding space; nothing else.'}], occurrences}
      : {label, tier: 2, evidence: decision.evidence, occurrences};
    const gss = exact?.gss ?? decision.gss;
    if (gss) {
      const identity = inputs.profiles.find(profile => profile.gss === gss);
      assert(identity, 'Assignment outside billing profiles');
      if (!profiles.has(gss)) profiles.set(gss, {...identity, labels: []});
      profiles.get(gss).labels.push(row);
    } else unassigned.push({...row, decision: decision.decision, bodyClass: decision.bodyClass});
  }
  return {source, profiles: sorted(profiles.keys()).map(gss => profiles.get(gss)), unassigned};
}

export function validateAuditCrosswalk(crosswalk, expected) {
  keys(crosswalk, ['source', 'profiles', 'unassigned']);
  validateSource(crosswalk.source);
  const codes = new Set(), labels = new Set();
  const validateLabel = row => {
    assert(!labels.has(row.label), 'Duplicate audit label'); labels.add(row.label);
    assert([1, 2].includes(row.tier));
    assert(Array.isArray(row.evidence) && row.evidence.length > 0, 'Missing audit evidence');
    if (row.tier === 2) validateEvidence(row.evidence);
    else for (const evidence of row.evidence) keys(evidence, ['registryPath', 'officialName', 'method']);
    for (const occurrence of row.occurrences) keys(occurrence, ['backstop', 'row']);
  };
  for (const profile of crosswalk.profiles) {
    keys(profile, ['gss', 'officialName', 'labels']);
    assert(!codes.has(profile.gss), 'Duplicate profile code in audit crosswalk'); codes.add(profile.gss);
    for (const row of profile.labels) {
      keys(row, ['label', 'tier', 'evidence', 'occurrences']);
      validateLabel(row);
    }
  }
  for (const row of crosswalk.unassigned) {
    keys(row, ['label', 'tier', 'evidence', 'occurrences', 'decision', 'bodyClass']);
    validateLabel(row);
  }
  assert.deepEqual(crosswalk, expected, 'Audit crosswalk does not reproduce from pinned identities and reviewed decisions');
}

export function auditDryRun(crosswalk, inputs) {
  const coverage = backstop => {
    const includes = row => !backstop || row.occurrences.some(item => item.backstop === backstop);
    const tier = n => crosswalk.profiles.filter(profile => profile.labels.some(row => row.tier === n && includes(row))).map(profile => profile.gss);
    const tier1 = tier(1), tier2 = tier(2), all = sorted(new Set([...tier1, ...tier2]));
    return {tier1: {count: tier1.length, profiles: tier1}, tier2: {count: tier2.length, profiles: tier2},
      tier2Additional: tier2.filter(gss => !tier1.includes(gss)).length,
      reached: {count: all.length, profiles: all},
      profilesOnNoList: inputs.profiles.filter(profile => !all.includes(profile.gss))};
  };
  return {date: AUDIT_DATE, profileCount: inputs.profiles.length, sourceLabels: 120, sourceRows: 150,
    tier1Labels: crosswalk.profiles.flatMap(profile => profile.labels).filter(row => row.tier === 1).length,
    tier2Labels: 51, combined: coverage(),
    byTable: inputs.tables.map(table => ({backstop: table.backstop, financialYears: table.financialYears,
      sourceRows: table.bodyRows, ...coverage(table.backstop)})),
    unresolvedLabels: crosswalk.unassigned.filter(row => row.decision === 'unresolved').map(row => row.label),
    notBillingProfilesByClass: BODY_CLASSES.map(bodyClass => ({bodyClass,
      labels: crosswalk.unassigned.filter(row => row.bodyClass === bodyClass).map(row => row.label)})),
    absenceInterpretation: 'Profiles on no list have no assigned main-accounts row in these three pinned lists. No publication, exemption, opinion or financial condition is inferred.',
    rendered: false};
}

const TABLE_KEYS = ['backstop', 'financialYears', 'questions'];
const ENTRY_KEYS = ['backstop', 'row', 'label', 'asterisk', 'answers'];

/** Answers exactly as printed for each profile row the crosswalk assigns. A value
 * exists only where the crosswalk has a row; the firm column is never read. */
export function buildAuditValues(crosswalk, inputs) {
  const questions = table => Object.fromEntries(ANSWER_KEYS.map((key, index) => [key, table.questions[index]]));
  return {date: AUDIT_DATE, footnote: {...ASTERISK_FOOTNOTE},
    tables: inputs.tables.map(table => ({backstop: table.backstop, financialYears: table.financialYears, questions: questions(table)})),
    profiles: crosswalk.profiles.map(profile => {
      const entries = profile.labels.flatMap(row => row.occurrences.map(occurrence => {
        const table = inputs.tables.find(item => item.backstop === occurrence.backstop);
        assert.equal(table.labels[occurrence.row - 1], row.label, 'Audit row locator differs from the pinned table');
        const printed = table.answers[occurrence.row - 1];
        return {backstop: occurrence.backstop, row: occurrence.row, label: row.label, asterisk: row.label.endsWith(` ${ASTERISK_FOOTNOTE.marker}`),
          answers: Object.fromEntries(ANSWER_KEYS.map((key, index) => [key, printed[index]]))};
      })).sort((a, b) => a.backstop.localeCompare(b.backstop));
      return {gss: profile.gss, officialName: profile.officialName, entries};
    })};
}

export function validateAuditValues(values, crosswalk) {
  keys(values, ['date', 'footnote', 'tables', 'profiles']);
  assert.equal(values.date, AUDIT_DATE);
  keys(values.footnote, Object.keys(ASTERISK_FOOTNOTE));
  assert.deepEqual(values.footnote, ASTERISK_FOOTNOTE, 'Audit footnote differs from the text pinned on retrieval');
  assert(Array.isArray(values.tables) && values.tables.length === 3, 'Expected three audit tables');
  for (const table of values.tables) {
    keys(table, TABLE_KEYS);
    keys(table.questions, ANSWER_KEYS);
    for (const question of Object.values(table.questions)) nonempty(question);
  }
  const backstops = values.tables.map(table => table.backstop);
  const crosswalked = new Map(crosswalk.profiles.map(profile => [profile.gss, profile]));
  const codes = new Set();
  assert(Array.isArray(values.profiles));
  for (const profile of values.profiles) {
    keys(profile, ['gss', 'officialName', 'entries']);
    assert(crosswalked.has(profile.gss), 'Audit value for a profile without a crosswalk row');
    assert.equal(profile.officialName, crosswalked.get(profile.gss).officialName);
    assert(!codes.has(profile.gss), 'Duplicate profile code in audit values'); codes.add(profile.gss);
    assert(Array.isArray(profile.entries) && profile.entries.length > 0, 'Audit profile without a pinned value');
    const seen = new Set();
    for (const entry of profile.entries) {
      keys(entry, ENTRY_KEYS);
      keys(entry.answers, ANSWER_KEYS);
      assert(backstops.includes(entry.backstop), 'Audit value outside the three pinned tables');
      // One line for each table on a profile; two rows on one table would need review.
      assert(!seen.has(entry.backstop), 'Two audit rows for one profile on one table'); seen.add(entry.backstop);
      assert(crosswalked.get(profile.gss).labels.some(row => row.label === entry.label
        && row.occurrences.some(item => item.backstop === entry.backstop && item.row === entry.row)), 'Audit value without a crosswalk row');
      assert.equal(entry.asterisk, entry.label.endsWith(` ${ASTERISK_FOOTNOTE.marker}`));
      if (entry.asterisk) assert.equal(entry.backstop, ASTERISK_FOOTNOTE.backstop, 'Asterisk outside the footnoted table');
      for (const answer of Object.values(entry.answers)) nonempty(answer);
    }
  }
}

export function auditValuesDryRun(values) {
  const byTable = values.tables.map(table => {
    const rows = values.profiles.flatMap(profile => profile.entries.filter(entry => entry.backstop === table.backstop)
      .map(entry => ({gss: profile.gss, ...entry})));
    const answers = Object.fromEntries(ANSWER_KEYS.map(key => [key, {question: table.questions[key],
      counts: Object.fromEntries(sorted(new Set(rows.map(row => row.answers[key]))).filter(answer => key !== 'dateDelivered' || !/^\d/.test(answer))
        .map(answer => [answer, rows.filter(row => row.answers[key] === answer).length])),
      ...(key === 'dateDelivered' ? {printedDates: rows.filter(row => /^\d/.test(row.answers[key])).length} : {})}]));
    return {backstop: table.backstop, financialYears: table.financialYears, profilesWithLines: rows.length,
      profiles: rows.map(row => row.gss), asterisk: rows.filter(row => row.asterisk).map(row => row.gss), answers};
  });
  return {date: AUDIT_DATE, profilesWithLines: values.profiles.length,
    profilesByTableCount: [1, 2, 3].map(count => ({tables: count, profiles: values.profiles.filter(profile => profile.entries.length === count).length})),
    byTable, footnote: {printed: values.footnote.printed, retrieved: values.footnote.retrieved,
      profiles: values.profiles.filter(profile => profile.entries.some(entry => entry.asterisk)).map(profile => profile.gss)},
    excluded: 'The appointed audit firm column is not read into any value file. Answers respond to the dated question in each printed column heading; they are not audit opinion types.'};
}

export function loadAuditCrosswalk(root = process.cwd()) {
  // No cache: a later mutation must still fail its pin.
  const manifest = JSON.parse(readFileSync(resolve(root, AUDIT_PATHS[0]), 'utf8'));
  const inputs = readInputs(root, manifest);
  assert.deepEqual(manifest.files.map(file => file.path), AUDIT_PATHS.slice(1), 'Unexpected audit file inventory');
  const [review, crosswalk, dryRun, values, valuesDryRun] = manifest.files.map(file => readPinned(root, file));
  const expected = buildAuditCrosswalk(manifest.source, review, inputs);
  validateAuditCrosswalk(crosswalk, expected);
  assert.deepEqual(dryRun, auditDryRun(expected, inputs), 'Audit dry run does not reproduce');
  validateAuditValues(values, crosswalk);
  assert.deepEqual(values, buildAuditValues(crosswalk, inputs), 'Audit values do not reproduce from the pinned tables');
  assert.deepEqual(valuesDryRun, auditValuesDryRun(values), 'Audit values dry run does not reproduce');
  return {source: manifest.source, crosswalk, dryRun, review, values, valuesDryRun, inputs};
}

// Explicit offline rebuild of derived outputs only. Input and review pins must
// already pass; changing an identity decision requires a separate manual review.
export function rebuildAuditCrosswalk(root = process.cwd()) {
  const manifest = JSON.parse(readFileSync(resolve(root, AUDIT_PATHS[0]), 'utf8'));
  const inputs = readInputs(root, manifest);
  assert.deepEqual(manifest.files.map(file => file.path), AUDIT_PATHS.slice(1), 'Unexpected audit file inventory');
  const review = readPinned(root, manifest.files[0]);
  const crosswalk = buildAuditCrosswalk(manifest.source, review, inputs);
  const values = buildAuditValues(crosswalk, inputs);
  const outputs = [crosswalk, auditDryRun(crosswalk, inputs), values, auditValuesDryRun(values)];
  for (const [index, value] of outputs.entries()) {
    const path = AUDIT_PATHS[index + 2];
    const bytes = `${JSON.stringify(value, null, 2)}\n`;
    writeFileSync(resolve(root, path), bytes);
    manifest.files[index + 1] = {path, sha256: digest(bytes)};
  }
  writeFileSync(resolve(root, AUDIT_PATHS[0]), `${JSON.stringify(manifest, null, 2)}\n`);
  return loadAuditCrosswalk(root);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--rebuild'), 'Use no option or --rebuild');
  const {dryRun, valuesDryRun} = process.argv[2] === '--rebuild' ? rebuildAuditCrosswalk() : loadAuditCrosswalk();
  console.log(JSON.stringify({profiles: dryRun.profileCount, tier1: dryRun.combined.tier1.count,
    tier2: dryRun.combined.tier2.count, tier2Additional: dryRun.combined.tier2Additional,
    reached: dryRun.combined.reached.count, onNoList: dryRun.combined.profilesOnNoList.length,
    unresolved: dryRun.unresolvedLabels.length, withLines: valuesDryRun.profilesWithLines,
    linesByTable: Object.fromEntries(valuesDryRun.byTable.map(table => [table.backstop, table.profilesWithLines]))}));
}
